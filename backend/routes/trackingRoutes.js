const express = require('express');
const router = express.Router();
const {
  updateTracking,
  getTracking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/:bookingId')
  .get(protect, getTracking)
  .put(protect, authorize('admin', 'subadmin'), updateTracking);

module.exports = router;
