import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { validate, validateParams, validateQuery, validateBody } from '../middleware/validation.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema
} from '../utils/validation.schemas';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for product operations
const createProductLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 product creation requests per windowMs
  message: {
    error: 'Too many products created from this IP',
    message: 'Please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: The name of the product
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: The description of the product
 *         price:
 *           type: number
 *           minimum: 0
 *           maximum: 999999.99
 *           description: The price of the product
 *         category:
 *           type: string
 *           maxLength: 100
 *           description: The category of the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was last updated
 *       example:
 *         id: 1
 *         name: "Laptop Pro 15\""
 *         description: "High-performance laptop with 15-inch display"
 *         price: 1299.99
 *         category: "Electronics"
 *         createdAt: "2023-08-29T10:00:00.000Z"
 *         updatedAt: "2023-08-29T10:00:00.000Z"
 *
 *     CreateProduct:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: The name of the product
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: The description of the product
 *         price:
 *           type: number
 *           minimum: 0
 *           maximum: 999999.99
 *           description: The price of the product
 *         category:
 *           type: string
 *           maxLength: 100
 *           description: The category of the product
 *       example:
 *         name: "Wireless Headphones"
 *         description: "Premium noise-canceling wireless headphones"
 *         price: 299.99
 *         category: "Electronics"
 *
 *     UpdateProduct:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: The name of the product
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: The description of the product
 *         price:
 *           type: number
 *           minimum: 0
 *           maximum: 999999.99
 *           description: The price of the product
 *         category:
 *           type: string
 *           maxLength: 100
 *           description: The category of the product
 *       example:
 *         name: "Wireless Headphones Pro"
 *         price: 349.99
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 */
router.get(
  '/',
  validateQuery(productQuerySchema),
  optionalAuthenticate,
  productController.getAllProducts
);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', productController.getCategories);

/**
 * @swagger
 * /api/products/statistics:
 *   get:
 *     summary: Get product statistics
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/statistics', authenticate, productController.getStatistics);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name or description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term is required
 */
router.get('/search', productController.searchProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get(
  '/:id',
  validateParams(productIdSchema),
  productController.getProductById
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post(
  '/',
  createProductLimiter,
  authenticate,
  validateBody(createProductSchema),
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.put(
  '/:id',
  authenticate,
  validateParams(productIdSchema),
  validateBody(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(productIdSchema),
  productController.deleteProduct
);

export default router;