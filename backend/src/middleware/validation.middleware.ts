import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationOptions {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

/**
 * Generic validation middleware factory
 */
export const validate = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate request body
    if (options.body) {
      const { error, value } = options.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.body = value;
      }
    }

    // Validate request parameters
    if (options.params) {
      const { error, value } = options.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.params = value;
      }
    }

    // Validate query parameters
    if (options.query) {
      const { error, value } = options.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.query = value;
      }
    }

    // Validate headers
    if (options.headers) {
      const { error, value } = options.headers.validate(req.headers, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.headers = value;
      }
    }

    // If there are validation errors, return bad request
    if (errors.length > 0) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: errors,
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          method: req.method
        }
      });
      return;
    }

    next();
  };
};

/**
 * Validate request body only
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return validate({ body: schema });
};

/**
 * Validate request params only
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return validate({ params: schema });
};

/**
 * Validate query parameters only
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate({ query: schema });
};