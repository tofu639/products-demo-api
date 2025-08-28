import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ProductQuery 
} from '../types/product.types';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class ProductController {
  /**
   * Get all products with filtering and pagination
   * GET /api/products
   */
  public getAllProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const query = req.query as unknown as ProductQuery;
      
      logger.debug('Get all products request:', query);

      const result = await productService.getProducts(query);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  public getProductById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      
      if (!id) {
        throw new AppError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }
      
      const productId = parseInt(id!, 10);

      logger.debug(`Get product by ID request: ${productId}`);

      const product = await productService.getProductById(productId);

      if (!product) {
        throw new AppError(
          'Product not found',
          404,
          'PRODUCT_NOT_FOUND'
        );
      }

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Create new product
   * POST /api/products
   */
  public createProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const productData: CreateProductDto = req.body;

      logger.debug('Create product request:', productData);

      const newProduct = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          createdAt: newProduct.createdAt.toISOString(),
          updatedAt: newProduct.updatedAt.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Update existing product
   * PUT /api/products/:id
   */
  public updateProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      
      if (!id) {
        throw new AppError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }
      
      const productId = parseInt(id!, 10);
      const productData: UpdateProductDto = req.body;

      logger.debug(`Update product request: ${productId}`, productData);

      const updatedProduct = await productService.updateProduct(productId, productData);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          category: updatedProduct.category,
          createdAt: updatedProduct.createdAt.toISOString(),
          updatedAt: updatedProduct.updatedAt.toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  public deleteProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      
      if (!id) {
        throw new AppError('Product ID is required', 400, 'INVALID_PRODUCT_ID');
      }
      
      const productId = parseInt(id!, 10);

      logger.debug(`Delete product request: ${productId}`);

      await productService.deleteProduct(productId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          id: productId,
          deletedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Get all categories
   * GET /api/products/categories
   */
  public getCategories = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      logger.debug('Get categories request');

      const categories = await productService.getCategories();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Search products
   * GET /api/products/search?q=searchTerm
   */
  public searchProducts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { q: searchTerm, limit } = req.query;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new AppError(
          'Search term is required',
          400,
          'SEARCH_TERM_REQUIRED'
        );
      }

      const searchLimit = limit ? parseInt(limit as string, 10) : 10;

      logger.debug(`Search products request: ${searchTerm}`);

      const products = await productService.searchProducts(searchTerm, searchLimit);

      const formattedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString()
      }));

      res.status(200).json({
        success: true,
        message: 'Products search completed',
        data: formattedProducts,
        meta: {
          searchTerm,
          resultsCount: formattedProducts.length,
          limit: searchLimit
        },
        timestamp: new Date().toISOString()
      });
    }
  );

  /**
   * Get product statistics
   * GET /api/products/statistics
   */
  public getStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      logger.debug('Get product statistics request');

      const statistics = await productService.getStatistics();

      res.status(200).json({
        success: true,
        message: 'Product statistics retrieved successfully',
        data: statistics,
        timestamp: new Date().toISOString()
      });
    }
  );
}

// Export singleton instance
export const productController = new ProductController();