import { body, param, query } from 'express-validator';
import validate from '../../middlewares/validateMiddleware.js';

export const validateLocation = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90 degrees'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180 degrees'),

  body('speed')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Speed must be a non-negative number'),

  body('heading')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 360 })
    .withMessage('Heading must be a number between 0 and 360 degrees'),

  body('accuracy')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a non-negative number'),

  body('busId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Provided busId must be a valid MongoDB ObjectId'),

  validate,
];

export const validateHistoryQuery = [
  param('busId')
    .isMongoId()
    .withMessage('Invalid bus ID format'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be an integer between 1 and 200'),

  validate,
];

export default {
  validateLocation,
  validateHistoryQuery,
};
