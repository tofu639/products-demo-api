# Products Demo API

A complete Web API project using Node.js with TypeScript that connects to SQL Server database. This project demonstrates modern API development practices with JWT authentication, comprehensive validation, and clean architecture.

## 🚀 Features

- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **CRUD Operations**: Full Create, Read, Update, Delete operations for products
- **SQL Server Integration**: Direct connection to SQL Server using stored procedures
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **Data Validation**: Request validation using Joi schema validation
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Error Handling**: Consistent error responses with detailed messages
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Unit Testing**: Comprehensive test coverage with Jest
- **Clean Architecture**: Separation of concerns with controllers, services, and routes
- **Security**: Helmet.js for security headers, CORS configuration
- **Logging**: Structured logging with Winston
- **Pagination**: Efficient data pagination for large datasets
- **Search & Filter**: Advanced search and filtering capabilities

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **SQL Server** (2017 or higher) or **SQL Server Express**
- **Git** (for version control)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/products-demo-api.git
cd products-demo-api/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using SQL Server Management Studio (SSMS)
1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open the database schema file: `../database/schema.sql`
4. Execute the script to create the database, tables, and stored procedures

#### Option B: Using Command Line (sqlcmd)
```bash
# Replace [SERVER_NAME] with your SQL Server instance name
sqlcmd -S [SERVER_NAME] -i "../database/schema.sql"
```

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your specific configuration
# Pay special attention to the database connection settings
```

**Important Environment Variables to Configure:**
- `DB_SERVER`: Your SQL Server instance name (e.g., `localhost` or `.\SQLEXPRESS`)
- `DB_PASSWORD`: Your SQL Server password
- `JWT_SECRET`: A long, random string for JWT token signing (REQUIRED in production)

### 5. Build the Application

```bash
npm run build
```

### 6. Start the Application

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The API will be available at: `http://localhost:3000`

## 📚 API Documentation

Once the application is running, you can access the interactive API documentation at:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

## 🔗 API Endpoints

### Health & Info
- `GET /health` - Health check endpoint
- `GET /api/info` - API information

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)
- `GET /api/auth/validate` - Validate JWT token (requires auth)

### Products
- `GET /api/products` - Get all products (with pagination and filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)
- `GET /api/products/categories` - Get all product categories
- `GET /api/products/search?q=term` - Search products
- `GET /api/products/statistics` - Get product statistics (requires auth)

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## 📝 Usage Examples

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123!"
  }'
```

### 3. Create a Product (with authentication)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with RGB lighting",
    "price": 49.99,
    "category": "Electronics"
  }'
```

### 4. Get All Products with Filtering
```bash
curl "http://localhost:3000/api/products?category=Electronics&pageSize=5&searchTerm=wireless"
```

## 🔧 Development

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

### Building for Production
```bash
npm run build
```

### Watch Mode for Development
```bash
npm run build:watch
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers and business logic coordination
│   │   ├── auth.controller.ts
│   │   └── product.controller.ts
│   ├── services/          # Business logic and data processing
│   │   ├── auth.service.ts
│   │   └── product.service.ts
│   ├── routes/            # API route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   └── product.routes.ts
│   ├── middleware/        # Custom middleware functions
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── config/            # Configuration files
│   │   ├── database.config.ts
│   │   ├── database.connection.ts
│   │   ├── database.types.ts
│   │   ├── auth.config.ts
│   │   └── swagger.config.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   └── product.types.ts
│   ├── utils/             # Utility functions and helpers
│   │   ├── logger.ts
│   │   └── validation.schemas.ts
│   ├── app.ts             # Express app configuration
│   └── server.ts          # Application entry point
├── tests/                 # Test files
│   ├── setup.ts
│   ├── services/
│   └── controllers/
├── database/              # Database scripts
│   └── schema.sql
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
└── README.md
```

## 🔒 Security Considerations

### Production Deployment Checklist

1. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Use a strong, random `JWT_SECRET`
   - Configure proper database credentials

2. **Database Security**:
   - Use SQL Server authentication with strong passwords
   - Enable SSL/TLS for database connections in production
   - Regularly update SQL Server and apply security patches

3. **Application Security**:
   - Keep all npm packages updated
   - Review and configure CORS settings for your domain
   - Set up proper logging and monitoring
   - Use HTTPS in production

4. **Rate Limiting**:
   - Adjust rate limits based on your requirements
   - Consider implementing IP whitelisting for admin operations

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```
Error: Failed to connect to database
```
**Solution**: Verify your database configuration in `.env`:
- Check `DB_SERVER`, `DB_USER`, `DB_PASSWORD`
- Ensure SQL Server is running and accessible
- Verify SQL Server authentication mode

#### JWT Token Issues
```
Error: JWT_SECRET is required in production environment
```
**Solution**: Set a strong `JWT_SECRET` in your `.env` file

#### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Change the `PORT` in your `.env` file or kill the process using port 3000

### Debugging Tips

1. **Enable Debug Logging**: Set `LOG_LEVEL=debug` in your `.env` file
2. **Check Database Logs**: Monitor SQL Server logs for connection issues
3. **Use API Documentation**: Test endpoints using the Swagger UI interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the API documentation at `/api-docs`
3. Open an issue on GitHub with detailed information about the problem

## 🔄 Version History

- **v1.0.0**: Initial release with complete CRUD operations, authentication, and documentation