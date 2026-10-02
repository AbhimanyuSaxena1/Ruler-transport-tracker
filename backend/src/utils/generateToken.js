import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/config.js';

/**
 * Generates short-lived Access Token (15m)
 * @param {Object} user
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      email: user.email,
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
    }
  );
};

/**
 * Generates long-lived Refresh Token (7d)
 * @param {Object} user
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );
};

/**
 * Verifies Access Token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

/**
 * Verifies Refresh Token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Cryptographically hashes token for secure storage in database
 * @param {string} token
 * @returns {string} SHA-256 hash
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
