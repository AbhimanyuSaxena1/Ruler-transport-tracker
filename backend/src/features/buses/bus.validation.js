import { body, param } from 'express-validator';
import validate from '../../middlewares/validateMiddleware.js';

export const validateCreateBus = [
  body('busNumber')
    .customSanitizer((val) => (val !== undefined && val !== null ? String(val) : ''))
    .trim()
    .notEmpty()
    .withMessage('Bus number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Bus number must be between 1 and 50 characters'),

  body('licensePlate')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('License plate must not exceed 20 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Status must be active, inactive, or maintenance'),

  validate,
];

export const validateAssignDriver = [
  param('id')
    .isMongoId()
    .withMessage('Invalid bus ID format'),

  body('driverId')
    .notEmpty()
    .withMessage('Driver ID is required')
    .isMongoId()
    .withMessage('Invalid driver ID format'),

  validate,
];

export default {
  validateCreateBus,
  validateAssignDriver,
  validateAssignRoute: [
    param('id').isMongoId().withMessage('Invalid bus ID format'),
    body('routeId').notEmpty().withMessage('Route ID is required').isMongoId().withMessage('Invalid route ID format'),
    validate,
  ],
};
