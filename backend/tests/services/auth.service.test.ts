import { authService } from '../../src/services/auth.service';
import { dbConnection } from '../../src/config/database.connection';
import { CreateUserDto, LoginDto } from '../../src/types/auth.types';

// Mock dependencies
jest.mock('../../src/config/database.connection');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockDbConnection = dbConnection as jest.Mocked<typeof dbConnection>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockHashedPassword = 'hashedPassword123';
      const mockCreatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const mockToken = 'mock-jwt-token';

      mockBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [mockCreatedUser],
        recordsets: [[mockCreatedUser]],
        output: {},
        rowsAffected: [1]
      });
      mockJwt.sign.mockReturnValue(mockToken as never);

      const result = await authService.register(userData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'CreateUser',
        {
          Username: 'testuser',
          Email: 'test@example.com',
          PasswordHash: mockHashedPassword
        }
      );
      expect(result).toEqual({
        user: mockCreatedUser,
        token: mockToken,
        expiresIn: '24h'
      });
    });

    it('should handle registration failure when user already exists', async () => {
      const userData: CreateUserDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Password123!'
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockDbConnection.executeStoredProcedure.mockRejectedValue(
        new Error('Username or email already exists')
      );

      await expect(authService.register(userData)).rejects.toThrow(
        'Username or email already exists'
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData: LoginDto = {
        username: 'testuser',
        password: 'Password123!'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const mockToken = 'mock-jwt-token';

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [mockUser],
        recordsets: [[mockUser]],
        output: {},
        rowsAffected: [1]
      });
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue(mockToken as never);

      const result = await authService.login(loginData);

      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'GetUserByUsername',
        { Username: 'testuser' }
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashedPassword123');
      expect(result).toEqual({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt
        },
        token: mockToken,
        expiresIn: '24h'
      });
    });

    it('should throw error when user not found', async () => {
      const loginData: LoginDto = {
        username: 'nonexistent',
        password: 'Password123!'
      };

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when password is invalid', async () => {
      const loginData: LoginDto = {
        username: 'testuser',
        password: 'WrongPassword'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [mockUser],
        recordsets: [[mockUser]],
        output: {},
        rowsAffected: [1]
      });
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      const mockPayload = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        iat: 1640995200,
        exp: 1641081600
      };

      mockJwt.verify.mockReturnValue(mockPayload as never);

      const result = authService.verifyToken('valid-token');

      expect(mockJwt.verify).toHaveBeenCalledWith('valid-token', 'test-jwt-secret-key-for-testing-only');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for expired token', () => {
      const mockError = new Error('jwt expired');
      mockError.name = 'TokenExpiredError';
      mockJwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => authService.verifyToken('expired-token')).toThrow('Token expired');
    });

    it('should throw error for invalid token', () => {
      const mockError = new Error('invalid token');
      mockError.name = 'JsonWebTokenError';
      mockJwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => authService.verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockDbConnection.executeQuery.mockResolvedValue({
        recordset: [mockUser],
        recordsets: [[mockUser]],
        output: {},
        rowsAffected: [1]
      });

      const result = await authService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        'SELECT id, username, email, createdAt, updatedAt FROM Users WHERE id = @userId',
        { userId: 1 }
      );
    });

    it('should return null when user not found', async () => {
      mockDbConnection.executeQuery.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const result = await authService.getUserById(999);

      expect(result).toBeNull();
    });
  });
});