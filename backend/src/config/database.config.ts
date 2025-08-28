import { DatabaseConfig } from './database.types';
import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: DatabaseConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ProductsDemo',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
    enableArithAbort: true,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '60000', 10),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '60000', 10),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
    },
  },
};