const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a vehicle name']
  },
  type: {
    type: String,
    enum: ['Car', 'Bike', 'Truck', 'Van'],
    required: [true, 'Please specify vehicle type']
  },
  images: [{
    type: String,
    required: true
  }],
  pricePerHour: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  garage: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
