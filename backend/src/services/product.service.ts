import { dbConnection } from '../config/database.connection';
import {
  Product,
  ProductQuery,
  CreateProductDto,
  UpdateProductDto,
  ProductListResponse,
  ProductStatistics,
  GetProductsInput,
  CreateProductInput,
  UpdateProductInput,
  DeleteProductInput
} from '../types/product.types';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class ProductService {
  /**
   * Get all products with filtering, pagination, and sorting
   */
  public async getProducts(query: ProductQuery): Promise<ProductListResponse> {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        category,
        searchTerm,
        minPrice,
        maxPrice
      } = query;

      logger.debug('Getting products with query:', query);

      const input: GetProductsInput = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        Category: category || null,
        SearchTerm: searchTerm || null
      };

      const result = await dbConnection.executeStoredProcedure<Product & { TotalCount: number }>(
        'GetProducts',
        input
      );

      if (!result.recordset || result.recordset.length === 0) {
        return {
          products: [],
          pagination: {
            currentPage: pageNumber,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }

      const totalCount = result.recordset[0]?.TotalCount || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Filter by price range if specified (additional client-side filtering)
      let products = result.recordset;
      if (minPrice !== undefined || maxPrice !== undefined) {
        products = products.filter(product => {
          if (minPrice !== undefined && product.price < minPrice) return false;
          if (maxPrice !== undefined && product.price > maxPrice) return false;
          return true;
        });
      }

      // Format products for response
      const formattedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }));

      return {
        products: formattedProducts,
        pagination: {
          currentPage: pageNumber,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1
        },
        ...(category || searchTerm || minPrice !== undefined || maxPrice !== undefined ? {
          filters: {
            ...(category && { category }),
            ...(searchTerm && { searchTerm }),
            ...(minPrice !== undefined && { minPrice }),
            ...(maxPrice !== undefined && { maxPrice })
          }
        } : {})
      };
    } catch (error) {
      logger.error('Error getting products:', error);
      throw new AppError(
        'Failed to retrieve products',
        500,
        'PRODUCTS_FETCH_ERROR'
      );
    }
  }

  /**
   * Get product by ID
   */
  public async getProductById(id: number): Promise<Product | null> {
    try {
      logger.debug(`Getting product by ID: ${id}`);

      const result = await dbConnection.executeStoredProcedure<Product>(
        'GetProductById',
        { Id: id }
      );

      if (!result.recordset || result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] || null;
    } catch (error) {
      logger.error(`Error getting product by ID ${id}:`, error);
      throw new AppError(
        'Failed to retrieve product',
        500,
        'PRODUCT_FETCH_ERROR'
      );
    }
  }

  /**
   * Create a new product
   */
  public async createProduct(productData: CreateProductDto): Promise<Product> {
    try {
      const { name, description, price, category } = productData;

      logger.debug('Creating product:', { name, category, price });

      const input: CreateProductInput = {
        Name: name,
        Description: description || null,
        Price: price,
        Category: category
      };

      const result = await dbConnection.executeStoredProcedure<Product>(
        'CreateProduct',
        input
      );

      if (!result.recordset || result.recordset.length === 0) {
        throw new AppError(
          'Failed to create product',
          500,
          'PRODUCT_CREATE_ERROR'
        );
      }

      const newProduct = result.recordset[0];
      if (!newProduct) {
        throw new AppError(
          'Failed to create product - no data returned',
          500,
          'PRODUCT_CREATE_ERROR'
        );
      }
      logger.info(`Product created successfully: ${newProduct.id}`);

      return newProduct;
    } catch (error) {
      logger.error('Error creating product:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to create product',
        500,
        'PRODUCT_CREATE_ERROR'
      );
    }
  }

  /**
   * Update an existing product
   */
  public async updateProduct(id: number, productData: UpdateProductDto): Promise<Product> {
    try {
      logger.debug(`Updating product ${id}:`, productData);

      // First check if product exists
      const existingProduct = await this.getProductById(id);
      if (!existingProduct) {
        throw new AppError(
          'Product not found',
          404,
          'PRODUCT_NOT_FOUND'
        );
      }

      // Merge existing data with updates
      const input: UpdateProductInput = {
        Id: id,
        Name: productData.name ?? existingProduct.name,
        Description: productData.description !== undefined 
          ? productData.description || null 
          : existingProduct.description,
        Price: productData.price ?? existingProduct.price,
        Category: productData.category ?? existingProduct.category
      };

      const result = await dbConnection.executeStoredProcedure<Product>(
        'UpdateProduct',
        input
      );

      if (!result.recordset || result.recordset.length === 0) {
        throw new AppError(
          'Failed to update product',
          500,
          'PRODUCT_UPDATE_ERROR'
        );
      }

      const updatedProduct = result.recordset[0];
      if (!updatedProduct) {
        throw new AppError(
          'Failed to update product - no data returned',
          500,
          'PRODUCT_UPDATE_ERROR'
        );
      }
      logger.info(`Product updated successfully: ${id}`);

      return updatedProduct;
    } catch (error) {
      logger.error(`Error updating product ${id}:`, error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to update product',
        500,
        'PRODUCT_UPDATE_ERROR'
      );
    }
  }

  /**
   * Delete a product
   */
  public async deleteProduct(id: number): Promise<void> {
    try {
      logger.debug(`Deleting product: ${id}`);

      // First check if product exists
      const existingProduct = await this.getProductById(id);
      if (!existingProduct) {
        throw new AppError(
          'Product not found',
          404,
          'PRODUCT_NOT_FOUND'
        );
      }

      const input: DeleteProductInput = { Id: id };

      await dbConnection.executeStoredProcedure(
        'DeleteProduct',
        input
      );

      logger.info(`Product deleted successfully: ${id}`);
    } catch (error) {
      logger.error(`Error deleting product ${id}:`, error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to delete product',
        500,
        'PRODUCT_DELETE_ERROR'
      );
    }
  }

  /**
   * Get all unique categories
   */
  public async getCategories(): Promise<string[]> {
    try {
      logger.debug('Getting all categories');

      const result = await dbConnection.executeQuery<{ category: string }>(
        'SELECT DISTINCT category FROM Products ORDER BY category'
      );

      return result.recordset.map(row => row.category);
    } catch (error) {
      logger.error('Error getting categories:', error);
      throw new AppError(
        'Failed to retrieve categories',
        500,
        'CATEGORIES_FETCH_ERROR'
      );
    }
  }

  /**
   * Get product statistics
   */
  public async getStatistics(): Promise<ProductStatistics> {
    try {
      logger.debug('Getting product statistics');

      // Get basic statistics
      const statsResult = await dbConnection.executeQuery<{
        totalProducts: number;
        averagePrice: number;
      }>(
        'SELECT COUNT(*) as totalProducts, AVG(price) as averagePrice FROM Products'
      );

      // Get category statistics
      const categoryResult = await dbConnection.executeQuery<{
        category: string;
        count: number;
        averagePrice: number;
        minPrice: number;
        maxPrice: number;
      }>(
        `SELECT 
          category,
          COUNT(*) as count,
          AVG(price) as averagePrice,
          MIN(price) as minPrice,
          MAX(price) as maxPrice
        FROM Products 
        GROUP BY category 
        ORDER BY count DESC`
      );

      // Get price range statistics
      const priceRangeResult = await dbConnection.executeQuery<{
        range: string;
        count: number;
      }>(
        `SELECT 
          CASE 
            WHEN price < 50 THEN 'Under $50'
            WHEN price < 100 THEN '$50 - $99'
            WHEN price < 500 THEN '$100 - $499'
            WHEN price < 1000 THEN '$500 - $999'
            ELSE 'Over $1000'
          END as range,
          COUNT(*) as count
        FROM Products 
        GROUP BY 
          CASE 
            WHEN price < 50 THEN 'Under $50'
            WHEN price < 100 THEN '$50 - $99'
            WHEN price < 500 THEN '$100 - $499'
            WHEN price < 1000 THEN '$500 - $999'
            ELSE 'Over $1000'
          END
        ORDER BY count DESC`
      );

      const totalProducts = statsResult.recordset[0]?.totalProducts || 0;

      return {
        totalProducts,
        averagePrice: Number(statsResult.recordset[0]?.averagePrice || 0),
        categories: categoryResult.recordset.map(cat => ({
          category: cat.category,
          count: cat.count,
          averagePrice: Number(cat.averagePrice),
          minPrice: Number(cat.minPrice),
          maxPrice: Number(cat.maxPrice)
        })),
        priceRanges: priceRangeResult.recordset.map(range => ({
          range: range.range,
          count: range.count,
          percentage: totalProducts > 0 ? (range.count / totalProducts) * 100 : 0
        }))
      };
    } catch (error) {
      logger.error('Error getting product statistics:', error);
      throw new AppError(
        'Failed to retrieve statistics',
        500,
        'STATISTICS_FETCH_ERROR'
      );
    }
  }

  /**
   * Search products by name or description
   */
  public async searchProducts(searchTerm: string, limit = 10): Promise<Product[]> {
    try {
      logger.debug(`Searching products for: ${searchTerm}`);

      const result = await dbConnection.executeQuery<Product>(
        `SELECT TOP (@limit) * FROM Products 
         WHERE name LIKE @searchTerm OR description LIKE @searchTerm
         ORDER BY 
           CASE 
             WHEN name LIKE @exactTerm THEN 1
             WHEN name LIKE @startTerm THEN 2
             ELSE 3
           END,
           name`,
        {
          searchTerm: `%${searchTerm}%`,
          exactTerm: searchTerm,
          startTerm: `${searchTerm}%`,
          limit
        }
      );

      return result.recordset;
    } catch (error) {
      logger.error('Error searching products:', error);
      throw new AppError(
        'Failed to search products',
        500,
        'PRODUCT_SEARCH_ERROR'
      );
    }
  }
}

// Export singleton instance
export const productService = new ProductService();