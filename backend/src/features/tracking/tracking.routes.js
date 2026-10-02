import express from 'express';
import trackingController from './tracking.controller.js';
import { validateLocation, validateHistoryQuery } from './tracking.validation.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/tracking/location
 * @desc    Receive GPS location from authenticated driver and update assigned bus
 * @access  Private (Driver or Admin)
 */
router.post(
  '/location',
  protect,
  authorize('driver', 'admin'),
  validateLocation,
  (req, res, next) => {
    trackingController.recordLocation(req, res, next);
  }
);

/**
 * @route   GET /api/tracking/:busId/history
 * @desc    Retrieve historical GPS breadcrumbs for a specific bus
 * @access  Private (Authenticated users: Admin, Driver, Passenger)
 */
router.get(
  '/:busId/history',
  protect,
  validateHistoryQuery,
  (req, res, next) => {
    trackingController.getLocationHistory(req, res, next);
  }
);

export default router;
