# API Usage Guide

This document provides detailed examples of how to use the Products Demo API.

## Authentication Flow

### 1. Register a New User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2023-08-29T10:00:00.000Z",
      "updatedAt": "2023-08-29T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "timestamp": "2023-08-29T10:00:00.000Z"
}
```

### 2. Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:** Same as registration response

### 3. Access Protected Endpoints

Include the JWT token in the Authorization header:

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Product Management

### 1. Create a Product

**Request:**
```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Wireless Bluetooth Headphones",
  "description": "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality",
  "price": 299.99,
  "category": "Electronics"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 11,
    "name": "Wireless Bluetooth Headphones",
    "description": "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality",
    "price": 299.99,
    "category": "Electronics",
    "createdAt": "2023-08-29T10:00:00.000Z",
    "updatedAt": "2023-08-29T10:00:00.000Z"
  },
  "timestamp": "2023-08-29T10:00:00.000Z"
}
```

### 2. Get All Products (with Pagination and Filtering)

**Request:**
```http
GET /api/products?pageNumber=1&pageSize=5&category=Electronics&searchTerm=wireless
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 2,
        "name": "Wireless Headphones",
        "description": "Premium noise-canceling wireless headphones with 30-hour battery life",
        "price": 299.99,
        "category": "Electronics",
        "createdAt": "2023-08-29T09:00:00.000Z",
        "updatedAt": "2023-08-29T09:00:00.000Z"
      },
      {
        "id": 11,
        "name": "Wireless Bluetooth Headphones",
        "description": "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality",
        "price": 299.99,
        "category": "Electronics",
        "createdAt": "2023-08-29T10:00:00.000Z",
        "updatedAt": "2023-08-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 5,
      "totalCount": 2,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    },
    "filters": {
      "category": "Electronics",
      "searchTerm": "wireless"
    }
  },
  "timestamp": "2023-08-29T10:00:00.000Z"
}
```

### 3. Get Product by ID

**Request:**
```http
GET /api/products/11
```

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 11,
    "name": "Wireless Bluetooth Headphones",
    "description": "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality",
    "price": 299.99,
    "category": "Electronics",
    "createdAt": "2023-08-29T10:00:00.000Z",
    "updatedAt": "2023-08-29T10:00:00.000Z"
  },
  "timestamp": "2023-08-29T10:00:00.000Z"
}
```

### 4. Update Product

**Request:**
```http
PUT /api/products/11
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Wireless Bluetooth Headphones Pro",
  "price": 349.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 11,
    "name": "Wireless Bluetooth Headphones Pro",
    "description": "Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality",
    "price": 349.99,
    "category": "Electronics",
    "createdAt": "2023-08-29T10:00:00.000Z",
    "updatedAt": "2023-08-29T10:15:00.000Z"
  },
  "timestamp": "2023-08-29T10:15:00.000Z"
}
```

### 5. Delete Product

**Request:**
```http
DELETE /api/products/11
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": 11,
    "deletedAt": "2023-08-29T10:20:00.000Z"
  },
  "timestamp": "2023-08-29T10:20:00.000Z"
}
```

## Advanced Features

### 1. Search Products

**Request:**
```http
GET /api/products/search?q=laptop&limit=5
```

**Response:**
```json
{
  "success": true,
  "message": "Products search completed",
  "data": [
    {
      "id": 1,
      "name": "Laptop Pro 15\"",
      "description": "High-performance laptop with 15-inch display, Intel i7 processor, 16GB RAM, 512GB SSD",
      "price": 1299.99,
      "category": "Electronics",
      "createdAt": "2023-08-29T08:00:00.000Z",
      "updatedAt": "2023-08-29T08:00:00.000Z"
    }
  ],
  "meta": {
    "searchTerm": "laptop",
    "resultsCount": 1,
    "limit": 5
  },
  "timestamp": "2023-08-29T10:25:00.000Z"
}
```

### 2. Get Categories

**Request:**
```http
GET /api/products/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    "Appliances",
    "Electronics",
    "Furniture",
    "Health",
    "Kitchen",
    "Sports"
  ],
  "timestamp": "2023-08-29T10:30:00.000Z"
}
```

### 3. Get Product Statistics (Requires Authentication)

**Request:**
```http
GET /api/products/statistics
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Product statistics retrieved successfully",
  "data": {
    "totalProducts": 10,
    "averagePrice": 285.49,
    "categories": [
      {
        "category": "Electronics",
        "count": 5,
        "averagePrice": 485.99,
        "minPrice": 79.99,
        "maxPrice": 1299.99
      },
      {
        "category": "Furniture",
        "count": 2,
        "averagePrice": 164.99,
        "minPrice": 79.99,
        "maxPrice": 249.99
      }
    ],
    "priceRanges": [
      {
        "range": "Under $50",
        "count": 1,
        "percentage": 10.0
      },
      {
        "range": "$50 - $99",
        "count": 3,
        "percentage": 30.0
      },
      {
        "range": "$100 - $499",
        "count": 4,
        "percentage": 40.0
      },
      {
        "range": "$500 - $999",
        "count": 1,
        "percentage": 10.0
      },
      {
        "range": "Over $1000",
        "count": 1,
        "percentage": 10.0
      }
    ]
  },
  "timestamp": "2023-08-29T10:35:00.000Z"
}
```

## Error Handling

### Validation Errors (400 Bad Request)

**Example Request:**
```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "",
  "price": -10,
  "category": "Electronics"
}
```

**Response:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [
      "Name cannot be empty",
      "Price must be greater than 0"
    ],
    "timestamp": "2023-08-29T10:40:00.000Z",
    "path": "/api/products",
    "method": "POST"
  }
}
```

### Authentication Errors (401 Unauthorized)

**Response:**
```json
{
  "error": "Authorization header missing",
  "message": "Access token is required"
}
```

### Not Found Errors (404 Not Found)

**Response:**
```json
{
  "error": {
    "message": "Product not found",
    "code": "PRODUCT_NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2023-08-29T10:45:00.000Z",
    "path": "/api/products/999",
    "method": "GET"
  }
}
```

### Rate Limit Errors (429 Too Many Requests)

**Response:**
```json
{
  "error": "Too many authentication attempts from this IP",
  "message": "Please try again after 15 minutes"
}
```

## Query Parameters Reference

### Product List Endpoint

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | integer | 1 | Page number (starts from 1) |
| `pageSize` | integer | 10 | Items per page (1-100) |
| `category` | string | - | Filter by category |
| `searchTerm` | string | - | Search in name and description |
| `sortBy` | string | createdAt | Sort field (name, price, category, createdAt) |
| `sortOrder` | string | desc | Sort order (asc, desc) |
| `minPrice` | number | - | Minimum price filter |
| `maxPrice` | number | - | Maximum price filter |

### Search Endpoint

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Search query (required) |
| `limit` | integer | 10 | Maximum results (1-50) |

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 408 | Request Timeout | Request took too long |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |