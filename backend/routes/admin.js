// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getStats,
  getUsers,
  toggleUserActive,
  getListings,
  toggleListing,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, roleCheck('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserActive);
router.get('/listings', getListings);
router.put('/listings/:id/toggle', toggleListing);

module.exports = router;
