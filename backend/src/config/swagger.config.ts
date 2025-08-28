import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products Demo API',
      version: '1.0.0',
      description: `
        A complete Web API project using Node.js with TypeScript that connects to SQL Server database.
        
        ## Features
        - **JWT Authentication**: Secure user authentication with JSON Web Tokens
        - **CRUD Operations**: Full Create, Read, Update, Delete operations for products
        - **SQL Server Integration**: Direct connection to SQL Server using stored procedures
        - **Data Validation**: Comprehensive request validation using Joi
        - **Rate Limiting**: Protection against abuse with configurable rate limits
        - **Error Handling**: Consistent error responses with detailed messages
        - **Pagination**: Efficient data pagination for large datasets
        - **Search & Filter**: Advanced search and filtering capabilities
        
        ## Authentication
        Most endpoints require authentication. To authenticate:
        1. Register a new user or login with existing credentials
        2. Use the returned JWT token in the Authorization header: \`Bearer <token>\`
        
        ## Rate Limiting
        - Authentication endpoints: 5 requests per 15 minutes per IP
        - Login endpoint: 10 requests per 15 minutes per IP
        - Product creation: 10 requests per 15 minutes per IP
      `,
      contact: {
        name: 'Products Demo API Support',
        email: 'support@products-demo-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.products-demo.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Authentication required'
                      },
                      code: {
                        type: 'string',
                        example: 'AUTH_REQUIRED'
                      },
                      statusCode: {
                        type: 'integer',
                        example: 401
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Validation failed'
                      },
                      code: {
                        type: 'string',
                        example: 'VALIDATION_ERROR'
                      },
                      statusCode: {
                        type: 'integer',
                        example: 400
                      },
                      details: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        example: ['Name is required', 'Price must be greater than 0']
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Product not found'
                      },
                      code: {
                        type: 'string',
                        example: 'PRODUCT_NOT_FOUND'
                      },
                      statusCode: {
                        type: 'integer',
                        example: 404
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Too many requests from this IP'
                  },
                  message: {
                    type: 'string',
                    example: 'Please try again after 15 minutes'
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Internal server error'
                      },
                      code: {
                        type: 'string',
                        example: 'INTERNAL_ERROR'
                      },
                      statusCode: {
                        type: 'integer',
                        example: 500
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      parameters: {
        PageNumber: {
          name: 'pageNumber',
          in: 'query',
          description: 'Page number for pagination (starts from 1)',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        PageSize: {
          name: 'pageSize',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        ProductId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID',
          schema: {
            type: 'integer',
            minimum: 1
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Health',
        description: 'API health and status endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts', // Path to the API routes
    './src/controllers/*.ts', // Path to the controllers
  ]
};

// Generate swagger specification
const specs = swaggerJsdoc(options);

// Custom CSS for Swagger UI
const customCss = `
  .swagger-ui .topbar { 
    display: none; 
  }
  .swagger-ui .info {
    margin: 20px 0;
  }
  .swagger-ui .info .title {
    color: #3b4151;
    font-size: 36px;
  }
  .swagger-ui .info .description {
    color: #3b4151;
    font-size: 14px;
  }
  .swagger-ui .scheme-container {
    background: #fafafa;
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #d3d3d3;
  }
`;

// Swagger UI options
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customCss,
  customSiteTitle: 'Products Demo API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    validatorUrl: null,
    oauth: {
      clientId: process.env.SWAGGER_CLIENT_ID || 'products-demo-api-client',
      clientSecret: process.env.SWAGGER_CLIENT_SECRET || 'your-client-secret',
      appName: 'Products Demo API'
    }
  }
};

/**
 * Setup Swagger documentation
 */
export const setupSwagger = (app: Express): void => {
  // Serve swagger docs at /api-docs
  app.use(
    '/api-docs', 
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerUiOptions)
  );

  // Serve swagger.json at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export { specs };
export default { setupSwagger, specs };