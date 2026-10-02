import authService from './auth.service.js';

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshAccessToken(refreshToken);
      return res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.user._id);
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
