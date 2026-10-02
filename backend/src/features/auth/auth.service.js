import userRepository from '../users/user.repository.js';
import ApiError from '../../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../utils/generateToken.js';

class AuthService {
  async register({ name, email, password, role = 'passenger' }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.badRequest('Email is already registered');
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      role,
    });

    // Generate dual tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save hashed refresh token to database
    await userRepository.updateRefreshToken(user._id, hashToken(refreshToken));

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBus: user.assignedBus,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true, false);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate dual tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store secure SHA-256 hash of refresh token
    await userRepository.updateRefreshToken(user._id, hashToken(refreshToken));

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBus: user.assignedBus,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(rawRefreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token has expired. Please log in again');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await userRepository.findById(decoded.id, true);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Verify token hash against stored hash in database
    const incomingHash = hashToken(rawRefreshToken);
    if (!user.refreshToken || user.refreshToken !== incomingHash) {
      throw ApiError.unauthorized('Refresh token has been revoked or is invalid');
    }

    // Issue fresh access token (15m) and rotated refresh token (7d)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await userRepository.updateRefreshToken(user._id, hashToken(newRefreshToken));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
    return true;
  }
}

export default new AuthService();
