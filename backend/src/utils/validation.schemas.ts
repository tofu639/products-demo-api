import Joi from 'joi';

// Product creation validation schema
export const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Name is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description must not exceed 1000 characters'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be greater than 0',
      'number.precision': 'Price can have at most 2 decimal places',
      'number.max': 'Price must not exceed 999,999.99',
      'any.required': 'Price is required'
    }),
  
  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'Category must be a string',
      'string.empty': 'Category cannot be empty',
      'string.min': 'Category must be at least 1 character long',
      'string.max': 'Category must not exceed 100 characters',
      'any.required': 'Category is required'
    })
});

// Product update validation schema
export const updateProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name must not exceed 255 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description must not exceed 1000 characters'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be greater than 0',
      'number.precision': 'Price can have at most 2 decimal places',
      'number.max': 'Price must not exceed 999,999.99'
    }),
  
  category: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.base': 'Category must be a string',
      'string.empty': 'Category cannot be empty',
      'string.min': 'Category must be at least 1 character long',
      'string.max': 'Category must not exceed 100 characters'
    })
}).min(1); // At least one field must be provided for update

// Product ID parameter validation
export const productIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Product ID must be a number',
      'number.integer': 'Product ID must be an integer',
      'number.positive': 'Product ID must be greater than 0',
      'any.required': 'Product ID is required'
    })
});

// Product query parameters validation
export const productQuerySchema = Joi.object({
  pageNumber: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page number must be a number',
      'number.integer': 'Page number must be an integer',
      'number.min': 'Page number must be at least 1'
    }),
  
  pageSize: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Page size must be a number',
      'number.integer': 'Page size must be an integer',
      'number.min': 'Page size must be at least 1',
      'number.max': 'Page size must not exceed 100'
    }),
  
  category: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Category must be a string',
      'string.max': 'Category must not exceed 100 characters'
    }),
  
  searchTerm: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Search term must be a string',
      'string.max': 'Search term must not exceed 255 characters'
    }),
  
  sortBy: Joi.string()
    .valid('name', 'price', 'category', 'createdAt')
    .default('createdAt')
    .messages({
      'string.base': 'Sort by must be a string',
      'any.only': 'Sort by must be one of: name, price, category, createdAt'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'string.base': 'Sort order must be a string',
      'any.only': 'Sort order must be either asc or desc'
    }),
  
  minPrice: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Minimum price must be a number',
      'number.positive': 'Minimum price must be greater than 0',
      'number.precision': 'Minimum price can have at most 2 decimal places'
    }),
  
  maxPrice: Joi.number()
    .positive()
    .precision(2)
    .min(Joi.ref('minPrice'))
    .optional()
    .messages({
      'number.base': 'Maximum price must be a number',
      'number.positive': 'Maximum price must be greater than 0',
      'number.precision': 'Maximum price can have at most 2 decimal places',
      'number.min': 'Maximum price must be greater than or equal to minimum price'
    })
});