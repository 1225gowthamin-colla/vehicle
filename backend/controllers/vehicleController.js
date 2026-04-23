const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('garage', 'name garageName email');
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('garage', 'name garageName email');
    
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Subadmin
const createVehicle = async (req, res, next) => {
  try {
    const { name, type, images, pricePerHour, isAvailable } = req.body;

    const vehicle = new Vehicle({
      name,
      type,
      images,
      pricePerHour: req.user.role === 'admin' ? pricePerHour : 0,
      isAvailable,
      garage: req.user._id, // Set garage to logged in subadmin or admin
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Subadmin
const updateVehicle = async (req, res, next) => {
  try {
    const { name, type, images, pricePerHour, isAvailable } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      // Check if user is the owner of the vehicle or an admin
      if (vehicle.garage.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to update this vehicle');
      }

      vehicle.name = name || vehicle.name;
      vehicle.type = type || vehicle.type;
      vehicle.images = images || vehicle.images;
      
      // Only admin can update price
      if (req.user.role === 'admin' && pricePerHour !== undefined) {
        vehicle.pricePerHour = pricePerHour;
      }

      if (isAvailable !== undefined) {
        vehicle.isAvailable = isAvailable;
      }

      const updatedVehicle = await vehicle.save();
      res.json(updatedVehicle);
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Subadmin
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      if (vehicle.garage.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized to delete this vehicle');
      }

      await vehicle.deleteOne();
      res.json({ message: 'Vehicle removed' });
    } else {
      res.status(404);
      throw new Error('Vehicle not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
