import { Router } from 'express';
import productRoutes from './product.routes';
import authRoutes from './auth.routes';
import { Request, Response } from 'express';
import { dbConnection } from '../config/database.connection';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await dbConnection.healthCheck();
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: dbHealthy ? 'healthy' : 'unhealthy'
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = dbHealthy ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'unhealthy'
      },
      error: 'Health check failed'
    });
  }
});

// API Info endpoint
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'Products Demo API',
    description: 'Complete Web API project using Node.js with TypeScript that connects to SQL Server database',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      authentication: '/api/auth',
      products: '/api/products'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

export default router;