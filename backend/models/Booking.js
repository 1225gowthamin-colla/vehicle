const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'On the way', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  currentLocation: {
    type: String,
    default: 'Garage'
  },
  estimatedTime: {
    type: String, // e.g. "30 mins"
  },
  arrivedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  garage: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  tracking: {
    type: trackingSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
