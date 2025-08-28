import request from 'supertest';
import App from '../../src/app';
import { dbConnection } from '../../src/config/database.connection';
import { authService } from '../../src/services/auth.service';

// Mock the database connection and auth service
jest.mock('../../src/config/database.connection');
jest.mock('../../src/services/auth.service');

const mockDbConnection = dbConnection as jest.Mocked<typeof dbConnection>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Product API Integration Tests', () => {
  let app: App;
  let server: any;

  beforeAll(async () => {
    app = new App();
    server = app.getApp();
    
    // Mock database connection
    mockDbConnection.connect.mockResolvedValue();
    mockDbConnection.healthCheck.mockResolvedValue(true);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product 1',
          description: 'Test Description 1',
          price: 99.99,
          category: 'Electronics',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          TotalCount: 2
        },
        {
          id: 2,
          name: 'Test Product 2',
          description: 'Test Description 2',
          price: 149.99,
          category: 'Electronics',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
          TotalCount: 2
        }
      ];

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: mockProducts,
        recordsets: [mockProducts],
        output: {},
        rowsAffected: [2]
      });

      const response = await request(server)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination.totalCount).toBe(2);
    });

    it('should return products with query parameters', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const response = await request(server)
        .get('/api/products?pageNumber=1&pageSize=5&category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'GetProducts',
        {
          PageNumber: 1,
          PageSize: 5,
          Category: 'Electronics',
          SearchTerm: null
        }
      );
    });

    it('should handle invalid query parameters', async () => {
      const response = await request(server)
        .get('/api/products?pageNumber=0&pageSize=200')
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [mockProduct],
        recordsets: [[mockProduct]],
        output: {},
        rowsAffected: [1]
      });

      const response = await request(server)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Test Product');
    });

    it('should return 404 when product not found', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const response = await request(server)
        .get('/api/products/999')
        .expect(404);

      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should handle invalid product ID', async () => {
      const response = await request(server)
        .get('/api/products/invalid')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/products', () => {
    const mockToken = 'valid-jwt-token';
    const mockUser = {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    beforeEach(() => {
      mockAuthService.verifyToken.mockReturnValue(mockUser);
      mockAuthService.getUserById.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should create product successfully with authentication', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 199.99,
        category: 'Electronics'
      };

      const createdProduct = {
        id: 1,
        ...newProduct,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [createdProduct],
        recordsets: [[createdProduct]],
        output: {},
        rowsAffected: [1]
      });

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Product');
      expect(response.body.data.id).toBe(1);
    });

    it('should require authentication', async () => {
      const newProduct = {
        name: 'New Product',
        price: 199.99,
        category: 'Electronics'
      };

      const response = await request(server)
        .post('/api/products')
        .send(newProduct)
        .expect(401);

      expect(response.body.error).toBe('Authorization header missing');
    });

    it('should validate product data', async () => {
      const invalidProduct = {
        // Missing required fields
        description: 'Invalid product'
      };

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContain('Name is required');
      expect(response.body.error.details).toContain('Price is required');
    });

    it('should validate price constraints', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: -10, // Invalid negative price
        category: 'Electronics'
      };

      const response = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContain('Price must be greater than 0');
    });
  });

  describe('PUT /api/products/:id', () => {
    const mockToken = 'valid-jwt-token';
    const mockUser = {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    beforeEach(() => {
      mockAuthService.verifyToken.mockReturnValue(mockUser);
      mockAuthService.getUserById.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should update product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Existing Product',
        description: 'Existing Description',
        price: 99.99,
        category: 'Electronics',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const updateData = {
        name: 'Updated Product',
        price: 149.99
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date('2023-01-02')
      };

      // Mock existing product lookup
      mockDbConnection.executeStoredProcedure
        .mockResolvedValueOnce({
          recordset: [existingProduct],
          recordsets: [[existingProduct]],
          output: {},
          rowsAffected: [1]
        })
        // Mock update operation
        .mockResolvedValueOnce({
          recordset: [updatedProduct],
          recordsets: [[updatedProduct]],
          output: {},
          rowsAffected: [1]
        });

      const response = await request(server)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Product');
      expect(response.body.data.price).toBe(149.99);
    });

    it('should return 404 when updating non-existent product', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const updateData = {
        name: 'Updated Product'
      };

      const response = await request(server)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('DELETE /api/products/:id', () => {
    const mockToken = 'valid-jwt-token';
    const mockUser = {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    beforeEach(() => {
      mockAuthService.verifyToken.mockReturnValue(mockUser);
      mockAuthService.getUserById.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should delete product successfully', async () => {
      const existingProduct = {
        id: 1,
        name: 'Product to Delete',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      // Mock existing product lookup
      mockDbConnection.executeStoredProcedure
        .mockResolvedValueOnce({
          recordset: [existingProduct],
          recordsets: [[existingProduct]],
          output: {},
          rowsAffected: [1]
        })
        // Mock delete operation
        .mockResolvedValueOnce({
          recordset: [{ Message: 'Product deleted successfully' }],
          recordsets: [[{ Message: 'Product deleted successfully' }]],
          output: {},
          rowsAffected: [1]
        });

      const response = await request(server)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });
  });

  describe('GET /api/products/categories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { category: 'Electronics' },
        { category: 'Furniture' },
        { category: 'Clothing' }
      ];

      mockDbConnection.executeQuery.mockResolvedValue({
        recordset: mockCategories,
        recordsets: [mockCategories],
        output: {},
        rowsAffected: [3]
      });

      const response = await request(server)
        .get('/api/products/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(['Electronics', 'Furniture', 'Clothing']);
    });
  });

  describe('GET /api/products/search', () => {
    it('should search products successfully', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Laptop Pro',
          description: 'High-performance laptop',
          price: 1299.99,
          category: 'Electronics',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        }
      ];

      mockDbConnection.executeQuery.mockResolvedValue({
        recordset: mockProducts,
        recordsets: [mockProducts],
        output: {},
        rowsAffected: [1]
      });

      const response = await request(server)
        .get('/api/products/search?q=laptop')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.searchTerm).toBe('laptop');
    });

    it('should require search term', async () => {
      const response = await request(server)
        .get('/api/products/search')
        .expect(400);

      expect(response.body.error.code).toBe('SEARCH_TERM_REQUIRED');
    });
  });
});