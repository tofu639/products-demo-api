import { dbConnection } from '../src/config/database.connection';
import { logger } from '../src/utils/logger';

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock logger to prevent actual logging during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock database connection
jest.mock('../src/config/database.connection', () => ({
  dbConnection: {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    executeStoredProcedure: jest.fn(),
    executeQuery: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true),
    getPool: jest.fn().mockResolvedValue({
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        execute: jest.fn(),
        query: jest.fn(),
      }),
    }),
  },
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_SERVER = 'localhost';
process.env.DB_NAME = 'TestProductsDemo';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

// Global test cleanup
afterAll(async () => {
  // Close any remaining connections
  jest.clearAllMocks();
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});