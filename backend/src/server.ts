import App from './app';
import { logger } from './utils/logger';

// Start the server
const startServer = async (): Promise<void> => {
  try {
    const app = new App();
    await app.start();
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

// Start the application
startServer();