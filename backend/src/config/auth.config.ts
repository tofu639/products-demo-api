import { AuthConfig } from '../types/auth.types';
import dotenv from 'dotenv';

dotenv.config();

export const authConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
};

// Validate required configuration
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production environment');
}