const express = require('express');
const router = express.Router();
const {
  getUsers,
  getSubAdmins,
  getTransactions,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/users', authorize('admin', 'subadmin'), getUsers);
router.get('/subadmins', authorize('admin'), getSubAdmins);
router.get('/transactions', authorize('admin'), getTransactions);
router.get('/analytics', authorize('admin'), getAnalytics);

module.exports = router;
