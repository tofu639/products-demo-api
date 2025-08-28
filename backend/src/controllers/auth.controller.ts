import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { CreateUserDto, LoginDto, JwtPayload } from '../types/auth.types';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userData: CreateUserDto = req.body;

      logger.debug('User registration request:', { 
        username: userData.username, 
        email: userData.email 
      });

      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const loginData: LoginDto = req.body;

      logger.debug('User login request:', { username: loginData.username });

      const result = await authService.login(loginData);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  public getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as JwtPayload;
      const userId = user.userId;

      logger.debug(`Get profile request for user: ${userId}`);

      const userRecord = await authService.getUserById(userId);

      if (!userRecord) {
        throw new AppError(
          'User not found',
          404,
          'USER_NOT_FOUND'
        );
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: userRecord.id,
            username: userRecord.username,
            email: userRecord.email,
            createdAt: userRecord.createdAt.toISOString(),
            updatedAt: userRecord.updatedAt.toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as JwtPayload;
      const currentToken = req.headers.authorization?.split(' ')[1];

      if (!currentToken) {
        throw new AppError(
          'Token is required',
          400,
          'TOKEN_REQUIRED'
        );
      }

      logger.debug(`Token refresh request for user: ${user.userId}`);

      const result = await authService.refreshToken(currentToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Logout user (client-side token invalidation)
   * POST /api/auth/logout
   */
  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as JwtPayload;
      logger.debug(`Logout request for user: ${user.userId}`);

      // In a production application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Store logout timestamp
      // 3. Clear any session data

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: {
          loggedOut: true,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Validate token endpoint (for client-side token validation)
   * GET /api/auth/validate
   */
  public validateToken = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as JwtPayload;
      // If we reach here, the token is valid (middleware already validated it)
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          valid: true,
          user: {
            userId: user.userId,
            username: user.username,
            email: user.email
          },
          expiresAt: user.exp ? new Date(user.exp * 1000).toISOString() : null
        },
        timestamp: new Date().toISOString()
      });
    }
  );
}

// Export singleton instance
export const authController = new AuthController();