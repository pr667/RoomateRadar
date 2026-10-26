// controllers/ratingController.js
const Rating = require('../models/Rating');
const User = require('../models/User');
const Request = require('../models/Request');
const mongoose = require('mongoose');

// ── POST /api/ratings ─────────────────────────────────────────────────────────
const createRating = async (req, res) => {
  try {
    const { rateeId, listingId, score, review, tags } = req.body;

    if (!mongoose.isValidObjectId(rateeId) || !mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: 'A valid ratee and listing are required' });
    }

    // Prevent self-rating
    if (rateeId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    const acceptedInteraction = await Request.findOne({
      listing: listingId,
      status: 'accepted',
      $or: [
        { seeker: req.user._id, host: rateeId },
        { seeker: rateeId, host: req.user._id },
      ],
    }).select('_id');

    if (!acceptedInteraction) {
      return res.status(403).json({ message: 'You can rate a user only after an accepted request for this listing' });
    }

    // Upsert: rater + ratee + listing combination must be unique
    const filter = { rater: req.user._id, ratee: rateeId, listing: listingId || null };
    const update = { score, review, tags };

    const rating = await Rating.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    // Recompute trustScore for the ratee
    const allRatings = await Rating.find({ ratee: rateeId });
    const totalRatings = allRatings.length;
    const avgScore =
      totalRatings > 0
        ? allRatings.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0;

    await User.findByIdAndUpdate(rateeId, {
      trustScore: Math.round(avgScore * 10) / 10,
      totalRatings,
    });

    res.status(201).json({ success: true, rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/ratings/user/:userId ─────────────────────────────────────────────
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate('rater', 'name avatar')
      .sort({ createdAt: -1 });

    const averageScore =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10
          ) / 10
        : 0;

    res.json({ success: true, ratings, averageScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRating, getUserRatings };
