// routes/ratings.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRating, getUserRatings } = require('../controllers/ratingController');

router.post('/', protect, createRating);
router.get('/user/:userId', getUserRatings);

module.exports = router;
