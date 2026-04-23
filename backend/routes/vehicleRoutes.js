const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getVehicles)
  .post(protect, authorize('admin', 'subadmin'), createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(protect, authorize('admin', 'subadmin'), updateVehicle)
  .delete(protect, authorize('admin', 'subadmin'), deleteVehicle);

module.exports = router;
