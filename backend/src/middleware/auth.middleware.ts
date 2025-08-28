import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { JwtPayload } from '../types/auth.types';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

/**
 * Authentication middleware to protect routes
 */
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        error: 'Authorization header missing',
        message: 'Access token is required'
      });
      return;
    }

    // Extract token from "Bearer <token>" format
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Authorization header must be in format: Bearer <token>'
      });
      return;
    }

    const token = tokenParts[1];
    
    if (!token) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Token cannot be empty'
      });
      return;
    }
    
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Optionally verify user still exists (for enhanced security)
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
      return;
    }

    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    
    let message = 'Authentication failed';
    let statusCode = 401;
    
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        message = 'Token has expired';
      } else if (error.message === 'Invalid token') {
        message = 'Invalid token provided';
      }
    }
    
    res.status(statusCode).json({
      error: 'Authentication failed',
      message
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token provided)
 */
export const optionalAuthenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const tokenParts = authHeader.split(' ');
      if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
        const token = tokenParts[1];
        if (token) {
          const decoded = authService.verifyToken(token);
          req.user = decoded;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't fail on optional authentication errors
    logger.warn('Optional authentication failed:', error);
    next();
  }
};

/**
 * Middleware to check if user has specific role (for future use)
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
      return;
    }

    // For now, all authenticated users have access
    // In a real application, you would check user roles here
    // const userRoles = req.user.roles || [];
    // const hasPermission = roles.some(role => userRoles.includes(role));
    
    // if (!hasPermission) {
    //   res.status(403).json({
    //     error: 'Insufficient permissions',
    //     message: 'You do not have permission to access this resource'
    //   });
    //   return;
    // }

    next();
  };
};