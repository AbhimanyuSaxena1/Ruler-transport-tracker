import express from 'express';
import busController from './bus.controller.js';
import { validateCreateBus, validateAssignDriver } from './bus.validation.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/buses
 * @desc    Create a new bus
 * @access  Private (Admin only)
 */
router.post('/', protect, authorize('admin'), validateCreateBus, (req, res, next) => {
  busController.createBus(req, res, next);
});

/**
 * @route   GET /api/buses
 * @desc    Get all buses (with current locations)
 * @access  Public (Passengers, Drivers, Admins)
 */
router.get('/', (req, res, next) => {
  busController.getBuses(req, res, next);
});

/**
 * @route   GET /api/buses/:id
 * @desc    Get single bus by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => {
  busController.getBusById(req, res, next);
});

/**
 * @route   PATCH /api/buses/:id/assign-driver
 * @desc    Assign a registered driver to a bus
 * @access  Private (Admin only)
 */
router.patch('/:id/assign-driver', protect, authorize('admin'), validateAssignDriver, (req, res, next) => {
  busController.assignDriver(req, res, next);
});

import busValidation from './bus.validation.js';
/**
 * @route   PATCH /api/buses/:id/assign-route
 * @desc    Assign a route to a bus
 * @access  Private (Admin only)
 */
router.patch('/:id/assign-route', protect, authorize('admin'), busValidation.validateAssignRoute, (req, res, next) => {
  busController.assignRoute(req, res, next);
});

/**
 * @route   DELETE /api/buses/:id
 * @desc    Delete a bus
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), (req, res, next) => {
  busController.deleteBus(req, res, next);
});

export default router;
