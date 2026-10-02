import express from 'express';
import authController from './auth.controller.js';
import { validateRegister, validateLogin, validateRefreshToken } from './auth.validation.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (admin, driver, or passenger)
 * @access  Public
 */
router.post('/register', validateRegister, (req, res, next) => {
  authController.register(req, res, next);
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return Access Token (15m) + Refresh Token (7d)
 * @access  Public
 */
router.post('/login', validateLogin, (req, res, next) => {
  authController.login(req, res, next);
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Exchange valid Refresh Token for fresh Access Token
 * @access  Public
 */
router.post('/refresh-token', validateRefreshToken, (req, res, next) => {
  authController.refreshToken(req, res, next);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate user's refresh token
 * @access  Private
 */
router.post('/logout', protect, (req, res, next) => {
  authController.logout(req, res, next);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user profile
 * @access  Private
 */
router.get('/me', protect, (req, res, next) => {
  authController.getMe(req, res, next);
});

/**
 * @route   GET /api/auth/users?role=driver
 * @desc    List users filtered by role (admin only)
 * @access  Private (Admin)
 */
import { authorize } from '../../middlewares/authMiddleware.js';
import userRepository from '../users/user.repository.js';

router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.query;
    let users;
    if (role === 'driver') {
      users = await userRepository.findDrivers();
    } else {
      // For now only support driver role filter
      users = await userRepository.findDrivers();
    }
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await userRepository.deleteById(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
