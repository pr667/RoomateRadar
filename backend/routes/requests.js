// routes/requests.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  sendRequest,
  getMyRequests,
  getIncomingRequests,
  respondToRequest,
  withdrawRequest,
} = require('../controllers/requestController');

router.post('/', protect, roleCheck('seeker', 'host'), sendRequest);
router.get('/my', protect, roleCheck('seeker', 'host'), getMyRequests);
router.get('/incoming', protect, roleCheck('host'), getIncomingRequests);
router.put('/:id', protect, roleCheck('host'), respondToRequest);
router.delete('/:id', protect, roleCheck('seeker', 'host'), withdrawRequest);

module.exports = router;
