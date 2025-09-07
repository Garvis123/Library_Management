// backend/routes/auth.js
const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public (Admin role creation requires admin auth)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, changePassword);

// @route   POST /api/auth/logout
// @desc    Logout user (optional endpoint for logging)
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   POST /api/auth/admin/register
// @desc    Register new admin (Admin only)
// @access  Private (Admin only)
router.post('/admin/register', authenticateToken, requireAdmin, (req, res) => {
  req.body.role = 'Admin';
  register(req, res);
});

module.exports = router;