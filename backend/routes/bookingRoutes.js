const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

module.exports = router;
