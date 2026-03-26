// routes/users.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  updatePreferences,
  uploadAvatar,
  toggleShortlist,
  getShortlist,
} = require('../controllers/userController');

// Multer config — store in memory for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Public routes
router.get('/:id', getProfile);

// Protected routes
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/shortlist/:listingId', protect, toggleShortlist);
router.get('/shortlist', protect, getShortlist);

module.exports = router;
