// routes/listings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  uploadListingPhotos,
  removeListingPhoto,
  replaceListingPhotos,
  getMyListings,
} = require('../controllers/listingController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Named routes before param routes
router.get('/my', protect, roleCheck('host'), getMyListings);
router.get('/', protect, getListings);
router.post('/', protect, roleCheck('host'), createListing);

// Public route – optional auth handled inside controller
router.get('/:id', getListing);

router.put('/:id', protect, roleCheck('host', 'admin'), updateListing);
router.delete('/:id', protect, roleCheck('host', 'admin'), deleteListing);
router.post(
  '/:id/photos',
  protect,
  roleCheck('host'),
  upload.array('photos', 10),
  uploadListingPhotos
);
router.put(
  '/:id/photos',
  protect,
  roleCheck('host'),
  upload.array('photos', 10),
  replaceListingPhotos
);
router.delete('/:id/photos', protect, roleCheck('host'), removeListingPhoto);

module.exports = router;
