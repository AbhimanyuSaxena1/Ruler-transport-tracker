import express from 'express';
import routeController from './route.controller.js';
import { validateCreateStop, validateCreateRoute } from './route.validation.js';
import { validate } from '../../middlewares/validateMiddleware.js';
import { protect, authorize } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// --- Stops ---
router.post(
  '/stops',
  protect,
  authorize('admin'), // Only admins can create stops
  validateCreateStop,
  validate,
  routeController.createStop
);

router.get('/stops', routeController.getAllStops);
router.delete('/stops/:id', protect, authorize('admin'), routeController.deleteStop);

// --- Routes ---
router.post(
  '/',
  protect,
  authorize('admin'), // Only admins can create routes
  validateCreateRoute,
  validate,
  routeController.createRoute
);

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.delete('/:id', protect, authorize('admin'), routeController.deleteRoute);

export default router;
