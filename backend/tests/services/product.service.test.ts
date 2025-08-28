import { productService } from '../../src/services/product.service';
import { dbConnection } from '../../src/config/database.connection';
import { AppError } from '../../src/middleware/error.middleware';
import { CreateProductDto, UpdateProductDto, ProductQuery } from '../../src/types/product.types';

// Mock the database connection
jest.mock('../../src/config/database.connection');
const mockDbConnection = dbConnection as jest.Mocked<typeof dbConnection>;

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products successfully', async () => {
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

      const query: ProductQuery = {
        pageNumber: 1,
        pageSize: 10
      };

      const result = await productService.getProducts(query);

      expect(result).toEqual({
        products: [
          {
            id: 1,
            name: 'Test Product 1',
            description: 'Test Description 1',
            price: 99.99,
            category: 'Electronics',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 2,
            name: 'Test Product 2',
            description: 'Test Description 2',
            price: 149.99,
            category: 'Electronics',
            createdAt: '2023-01-02T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z'
          }
        ],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'GetProducts',
        {
          PageNumber: 1,
          PageSize: 10,
          Category: null,
          SearchTerm: null
        }
      );
    });

    it('should return empty result when no products found', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const query: ProductQuery = { pageNumber: 1, pageSize: 10 };
      const result = await productService.getProducts(query);

      expect(result.products).toEqual([]);
      expect(result.pagination.totalCount).toBe(0);
    });

    it('should handle database errors', async () => {
      mockDbConnection.executeStoredProcedure.mockRejectedValue(new Error('Database error'));

      const query: ProductQuery = { pageNumber: 1, pageSize: 10 };

      await expect(productService.getProducts(query)).rejects.toThrow(AppError);
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
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

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'GetProductById',
        { Id: 1 }
      );
    });

    it('should return null when product not found', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const result = await productService.getProductById(999);

      expect(result).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const mockCreatedProduct = {
        id: 1,
        name: 'New Product',
        description: 'New Description',
        price: 199.99,
        category: 'Electronics',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [mockCreatedProduct],
        recordsets: [[mockCreatedProduct]],
        output: {},
        rowsAffected: [1]
      });

      const productData: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 199.99,
        category: 'Electronics'
      };

      const result = await productService.createProduct(productData);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'CreateProduct',
        {
          Name: 'New Product',
          Description: 'New Description',
          Price: 199.99,
          Category: 'Electronics'
        }
      );
    });

    it('should handle creation failure', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const productData: CreateProductDto = {
        name: 'New Product',
        price: 199.99,
        category: 'Electronics'
      };

      await expect(productService.createProduct(productData)).rejects.toThrow(AppError);
    });
  });

  describe('updateProduct', () => {
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

      const updatedProduct = {
        ...existingProduct,
        name: 'Updated Product',
        price: 149.99,
        updatedAt: new Date('2023-01-02')
      };

      // Mock getting existing product
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

      const updateData: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99
      };

      const result = await productService.updateProduct(1, updateData);

      expect(result).toEqual(updatedProduct);
      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'UpdateProduct',
        {
          Id: 1,
          Name: 'Updated Product',
          Description: 'Existing Description',
          Price: 149.99,
          Category: 'Electronics'
        }
      );
    });

    it('should throw error when product not found for update', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      const updateData: UpdateProductDto = {
        name: 'Updated Product'
      };

      await expect(productService.updateProduct(999, updateData)).rejects.toThrow(AppError);
    });
  });

  describe('deleteProduct', () => {
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

      // Mock getting existing product
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

      await productService.deleteProduct(1);

      expect(mockDbConnection.executeStoredProcedure).toHaveBeenCalledWith(
        'DeleteProduct',
        { Id: 1 }
      );
    });

    it('should throw error when product not found for deletion', async () => {
      mockDbConnection.executeStoredProcedure.mockResolvedValue({
        recordset: [],
        recordsets: [[]],
        output: {},
        rowsAffected: [0]
      });

      await expect(productService.deleteProduct(999)).rejects.toThrow(AppError);
    });
  });

  describe('getCategories', () => {
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

      const result = await productService.getCategories();

      expect(result).toEqual(['Electronics', 'Furniture', 'Clothing']);
    });
  });

  describe('searchProducts', () => {
    it('should return search results', async () => {
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

      const result = await productService.searchProducts('laptop', 10);

      expect(result).toEqual(mockProducts);
      expect(mockDbConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE name LIKE @searchTerm OR description LIKE @searchTerm'),
        expect.objectContaining({
          searchTerm: '%laptop%',
          limit: 10
        })
      );
    });
  });
});