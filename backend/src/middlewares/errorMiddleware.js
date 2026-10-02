import ApiError from '../utils/ApiError.js';
import config from '../config/config.js';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError' && !err.statusCode) {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}'`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && !err.statusCode) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `A record with ${field} '${val}' already exists. Please use a unique value.`;
  }

  const response = {
    success: false,
    message,
    errors,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export default {
  notFoundHandler,
  errorHandler,
};
