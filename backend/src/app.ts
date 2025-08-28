import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger.config';
import routes from './routes';
import { 
  errorHandler, 
  notFoundHandler, 
  validationErrorHandler 
} from './middleware/error.middleware';
import { dbConnection } from './config/database.connection';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class App {
  public app: Express;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSwagger();
  }

  /**
   * Initialize middleware stack
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4200'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Authorization',
        'Accept',
        'Cache-Control',
        'Pragma'
      ],
      credentials: true,
      maxAge: 86400 // 24 hours
    }));

    // Compression middleware
    this.app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));

    // Body parsing middleware
    this.app.use(express.json({
      limit: process.env.JSON_LIMIT || '10mb',
      strict: true
    }));

    this.app.use(express.urlencoded({
      extended: true,
      limit: process.env.URL_ENCODED_LIMIT || '10mb'
    }));

    // Request logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          }
        }
      }));
    }

    // Request timeout middleware
    this.app.use((req: Request, res: Response, next) => {
      const timeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
      
      const timer = setTimeout(() => {
        if (!res.headersSent) {
          logger.error(`Request timeout: ${req.method} ${req.originalUrl}`);
          res.status(408).json({
            error: {
              message: 'Request timeout',
              code: 'REQUEST_TIMEOUT',
              statusCode: 408,
              timestamp: new Date().toISOString()
            }
          });
        }
      }, timeout);

      res.on('finish', () => {
        clearTimeout(timer);
      });

      next();
    });

    // Request ID middleware
    this.app.use((req: Request, res: Response, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || 
        Math.random().toString(36).substring(2, 15);
      
      res.setHeader('X-Request-ID', req.headers['x-request-id']);
      next();
    });

    // Health check middleware (before other routes)
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const dbHealthy = await dbConnection.healthCheck();
        
        res.status(dbHealthy ? 200 : 503).json({
          status: dbHealthy ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          services: {
            api: 'healthy',
            database: dbHealthy ? 'healthy' : 'unhealthy'
          }
        });
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          services: {
            api: 'healthy',
            database: 'unhealthy'
          }
        });
      }
    });
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Welcome to Products Demo API',
        version: process.env.npm_package_version || '1.0.0',
        documentation: '/api-docs',
        health: '/health',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api', routes);

    // Favicon handling
    this.app.get('/favicon.ico', (req: Request, res: Response) => {
      res.status(204).end();
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Handle validation errors
    this.app.use(validationErrorHandler);

    // Handle 404 errors
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Initialize Swagger documentation
   */
  private initializeSwagger(): void {
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
      setupSwagger(this.app);
    }
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await dbConnection.connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await this.initializeDatabase();

      // Start server
      const server = this.app.listen(this.port, () => {
        logger.info(`🚀 Server is running on port ${this.port}`);
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`🏥 Health Check: http://localhost:${this.port}/health`);
        logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      // Graceful shutdown handling
      const gracefulShutdown = async (signal: string): Promise<void> => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        
        server.close(async () => {
          logger.info('HTTP server closed');
          
          try {
            await dbConnection.close();
            logger.info('Database connection closed');
          } catch (error) {
            logger.error('Error closing database connection:', error);
          }
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
          logger.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      };

      // Listen for termination signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      // Handle uncaught exceptions
      process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('unhandledRejection');
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express application instance
   */
  public getApp(): Express {
    return this.app;
  }
}

export default App;