// controllers/adminController.js
const User = require('../models/User');
const Listing = require('../models/Listing');
const Request = require('../models/Request');
const Rating = require('../models/Rating');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      seekers,
      hosts,
      activeListings,
      pendingRequests,
      acceptedRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'host' }),
      Listing.countDocuments({ isActive: true }),
      Request.countDocuments({ status: 'pending' }),
      Request.countDocuments({ status: 'accepted' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        seekers,
        hosts,
        activeListings,
        pendingRequests,
        acceptedRequests,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/admin/users/:id/toggle ──────────────────────────────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/listings ───────────────────────────────────────────────────
const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('host', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/admin/listings/:id/toggle ───────────────────────────────────────
const toggleListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.isActive = !listing.isActive;
    await listing.save();

    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getUsers, toggleUserActive, getListings, toggleListing };
