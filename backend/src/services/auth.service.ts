import * as jwt from 'jsonwebtoken';
const bcrypt = require('bcryptjs');
import { authConfig } from '../config/auth.config';
import { dbConnection } from '../config/database.connection';
import { 
  User, 
  CreateUserDto, 
  LoginDto, 
  JwtPayload, 
  AuthResponse 
} from '../types/auth.types';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Register a new user
   */
  public async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const { username, email, password } = userData;

      // Hash password
      const passwordHash = await bcrypt.hash(password, authConfig.saltRounds);

      // Create user in database
      const result = await dbConnection.executeStoredProcedure<User>(
        'CreateUser',
        {
          Username: username,
          Email: email,
          PasswordHash: passwordHash,
        }
      );

      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('Failed to create user');
      }

      const newUser = result.recordset[0]!;
      
      // Generate JWT token
      const token = this.generateToken({
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });

      logger.info(`User registered successfully: ${username}`);

      return {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
        token,
        expiresIn: authConfig.jwtExpiresIn,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          throw new Error('Username or email already exists');
        }
        throw error;
      }
      
      throw new Error('Registration failed');
    }
  }

  /**
   * Login user
   */
  public async login(loginData: LoginDto): Promise<AuthResponse> {
    try {
      const { username, password } = loginData;

      // Get user from database
      const result = await dbConnection.executeStoredProcedure<User>(
        'GetUserByUsername',
        { Username: username }
      );

      if (!result.recordset || result.recordset.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.recordset[0]!;

      // Verify password
      if (!user.passwordHash) {
        throw new Error('Invalid user data');
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      logger.info(`User logged in successfully: ${username}`);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        expiresIn: authConfig.jwtExpiresIn,
      };
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error instanceof Error && error.message === 'Invalid credentials') {
        throw error;
      }
      
      throw new Error('Login failed');
    }
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      logger.error('Token verification error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new Error('Token expired');
        } else if (error.name === 'JsonWebTokenError') {
          throw new Error('Invalid token');
        }
      }
      
      throw new Error('Token verification failed');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const jwtPayload: object = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email
    };
    
    // @ts-ignore - JWT type definition issue with overloaded functions
    return jwt.sign(
      jwtPayload,
      authConfig.jwtSecret,
      {
        expiresIn: authConfig.jwtExpiresIn,
      }
    );
  }

  /**
   * Get user by ID (for token validation)
   */
  public async getUserById(userId: number): Promise<User | null> {
    try {
      const result = await dbConnection.executeQuery<User>(
        'SELECT id, username, email, createdAt, updatedAt FROM Users WHERE id = @userId',
        { userId }
      );

      return result.recordset && result.recordset.length > 0 
        ? result.recordset[0]! 
        : null;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Refresh token (generate new token for existing user)
   */
  public async refreshToken(currentToken: string): Promise<AuthResponse> {
    try {
      const decoded = this.verifyToken(currentToken);
      
      // Get fresh user data
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        expiresIn: authConfig.jwtExpiresIn,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();