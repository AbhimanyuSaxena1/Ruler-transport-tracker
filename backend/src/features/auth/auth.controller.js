import authService from './auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

class AuthController {
  async register(req, res, next) {
    try {
      const data = await authService.register(req.body);
      res.cookie('refreshToken', data.refreshToken, getCookieOptions());
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
      res.cookie('refreshToken', data.refreshToken, getCookieOptions());
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
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided in cookies or request body',
        });
      }
      const tokens = await authService.refreshAccessToken(token);
      res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
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
      if (req.user?._id) {
        await authService.logout(req.user._id);
      }
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });
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
