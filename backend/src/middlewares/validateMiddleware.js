import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware that evaluates results from express-validator rule chains.
 * If validation errors exist, formats them and forwards an ApiError.badRequest to errorMiddleware.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(ApiError.badRequest('Validation Error', formattedErrors));
  }
  next();
};

export default validate;
