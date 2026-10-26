// controllers/userController.js
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get user profile (public)
// @route   GET /api/users/:id
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name role avatar bio preferences trustScore totalRatings isVerified isProfileComplete createdAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile (name, bio, avatar)
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar, phone } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (avatar !== undefined) update.avatar = avatar;
    if (phone !== undefined) update.phone = phone;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
const updatePreferences = async (req, res) => {
  try {
    const { 
      food, sleep, smoking, drinking, pets, gender, cleanliness, 
      noise, workSchedule, budgetMin, budgetMax, preferredLocations 
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        preferences: {
          food: food || 'any',
          sleep: sleep || 'flexible',
          smoking: smoking || false,
          drinking: drinking || false,
          pets: pets || false,
          gender: gender || 'any',
          cleanliness: cleanliness || 3,
          noise: noise || 'moderate',
          workSchedule: workSchedule || 'office',
          budgetMin: budgetMin || 0,
          budgetMax: budgetMax || 50000,
          preferredLocations: preferredLocations || [],
        },
        isProfileComplete: true,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Upload avatar to Cloudinary
// @route   POST /api/users/upload-avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // Convert buffer to stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'roommateradar/avatars',
        resource_type: 'auto',
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
      },
      (error, result) => {
        if (error) return res.status(400).json({ message: error.message });

        // Update user with avatar URL
        User.findByIdAndUpdate(
          req.user._id,
          { avatar: result.secure_url },
          { new: true }
        )
          .then((user) =>
            res.json({
              success: true,
              avatarUrl: result.secure_url,
              user,
            })
          )
          .catch((err) => res.status(500).json({ message: err.message }));
      }
    );

    // Pipe the buffer to Cloudinary
    Readable.from(req.file.buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Toggle shortlist
// @route   PUT /api/users/shortlist/:listingId
const toggleShortlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;

    if (user.shortlist.includes(listingId)) {
      user.shortlist.pull(listingId);
    } else {
      user.shortlist.push(listingId);
    }

    await user.save();
    res.json({ success: true, shortlist: user.shortlist, isShortlisted: user.shortlist.includes(listingId) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my shortlist
// @route   GET /api/users/shortlist
const getShortlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('shortlist');
    res.json({ success: true, shortlist: user.shortlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  uploadAvatar,
  toggleShortlist,
  getShortlist,
};
