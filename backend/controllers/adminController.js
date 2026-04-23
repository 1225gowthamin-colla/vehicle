const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subadmins
// @route   GET /api/admin/subadmins
// @access  Private/Admin
const getSubAdmins = async (req, res, next) => {
  try {
    const subadmins = await User.find({ role: 'subadmin' }).select('-password');
    res.json(subadmins);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Booking.find()
      .select('user garage vehicle totalAmount paymentStatus createdAt')
      .populate('user', 'name email')
      .populate('garage', 'name garageName')
      .populate('vehicle', 'name');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSubAdmins = await User.countDocuments({ role: 'subadmin' });
    const totalBookings = await Booking.countDocuments();
    
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      totalUsers,
      totalSubAdmins,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getSubAdmins,
  getTransactions,
  getAnalytics,
};
