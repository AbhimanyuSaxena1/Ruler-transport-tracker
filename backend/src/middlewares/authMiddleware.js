import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/generateToken.js';
import userRepository from '../features/users/user.repository.js';

/**
 * Protect middleware: Verifies short-lived Bearer Access Token (15m)
 * and attaches authenticated user entity to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required: No Bearer token provided');
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token has expired. Please refresh your token');
      }
      throw ApiError.unauthorized('Invalid access token');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control middleware
 * Restricts access to users matching specified roles.
 * @param  {...string} roles Allowed roles ('admin', 'driver', 'passenger')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export default {
  protect,
  authorize,
};
