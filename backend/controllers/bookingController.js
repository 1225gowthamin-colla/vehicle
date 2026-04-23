const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/User
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startTime, endTime } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    if (!vehicle.isAvailable) {
      res.status(400);
      throw new Error('Vehicle is currently not available');
    }

    // Calculate total amount (basic calculation)
    const hours = Math.abs(new Date(endTime) - new Date(startTime)) / 36e5;
    const totalAmount = hours * vehicle.pricePerHour;

    const booking = new Booking({
      user: req.user._id,
      vehicle: vehicleId,
      garage: vehicle.garage,
      startTime,
      endTime,
      totalAmount,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let bookings;
    
    if (req.user.role === 'admin') {
      bookings = await Booking.find().populate('user vehicle garage');
    } else if (req.user.role === 'subadmin') {
      bookings = await Booking.find({ garage: req.user._id }).populate('user vehicle garage');
    } else {
      bookings = await Booking.find({ user: req.user._id }).populate('vehicle garage');
    }

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update tracking status
// @route   PUT /api/tracking/:bookingId
// @access  Private/Subadmin
const updateTracking = async (req, res, next) => {
  try {
    const { status, currentLocation, estimatedTime } = req.body;
    
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.garage.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized to update tracking for this booking');
    }

    booking.tracking.status = status || booking.tracking.status;
    booking.tracking.currentLocation = currentLocation || booking.tracking.currentLocation;
    booking.tracking.estimatedTime = estimatedTime || booking.tracking.estimatedTime;
    
    if (status === 'Delivered') {
      booking.tracking.arrivedAt = Date.now();
    } else if (status === 'On the way') {
      booking.tracking.arrivedAt = undefined; // Reset if status changes back
    }
    
    booking.tracking.updatedAt = Date.now();

    const updatedBooking = await booking.save();

    res.json(updatedBooking.tracking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking status
// @route   GET /api/tracking/:bookingId
// @access  Private
const getTracking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.user.toString() !== req.user._id.toString() && 
        booking.garage.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized to view tracking for this booking');
    }

    res.json(booking.tracking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateTracking,
  getTracking,
};
