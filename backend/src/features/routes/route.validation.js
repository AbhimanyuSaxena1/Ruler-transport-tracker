import { body } from 'express-validator';

export const validateCreateStop = [
  body('name')
    .notEmpty().withMessage('Stop name is required')
    .isString().withMessage('Stop name must be a string'),
  body('latitude')
    .isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude')
    .isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];

export const validateCreateRoute = [
  body('routeName')
    .notEmpty().withMessage('Route name is required')
    .isString(),
  body('origin')
    .notEmpty().withMessage('Origin is required'),
  body('destination')
    .notEmpty().withMessage('Destination is required'),
  body('stops')
    .optional()
    .isArray().withMessage('Stops must be an array of Stop IDs'),
  body('stops.*')
    .isMongoId().withMessage('Invalid Stop ID format'),
  body('path.coordinates')
    .optional()
    .isArray().withMessage('Path coordinates must be an array'),
];
