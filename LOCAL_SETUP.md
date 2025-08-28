# 🚀 Local Development Setup Guide

This guide will help you set up and run the Products Demo API on your local machine.

## 📋 Prerequisites

### Required Software
1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **SQL Server** - One of the following:
   - SQL Server Express (Free) - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
   - SQL Server LocalDB (Lightweight option)
   - Docker SQL Server container
3. **Git** - [Download from git-scm.com](https://git-scm.com/)

### Optional Tools
- **SQL Server Management Studio (SSMS)** - For database management
- **VS Code** - Recommended IDE with TypeScript support
- **Postman** - For API testing

## 🛠️ Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/tofu639/products-demo-api.git
cd products-demo-api
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Database Setup

#### Option A: SQL Server Express/LocalDB
1. **Create Database**:
   ```sql
   CREATE DATABASE ProductsDemo;
   ```

2. **Run Schema Script**:
   - Open SQL Server Management Studio
   - Connect to your SQL Server instance
   - Open `database/schema.sql`
   - Execute the script to create tables and stored procedures

#### Option B: Docker SQL Server (Alternative)
```bash
# Pull and run SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2019-latest

# Wait for container to start, then create database
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
   -S localhost -U SA -P "YourStrong!Passw0rd" \
   -Q "CREATE DATABASE ProductsDemo"
```

### Step 4: Environment Configuration
```bash
# Copy environment template
cd backend
cp .env.example .env
```

**Edit `.env` file with your database settings**:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_SERVER=localhost
DB_NAME=ProductsDemo
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL=debug
```

### Step 5: Run Database Migrations
```bash
# Make sure your database connection works
npm run db:setup
```

## 🏃‍♂️ Running the Application

### Development Mode (with hot reload)
```bash
cd backend
npm run dev
```

### Production Build
```bash
cd backend
npm run build
npm start
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🌐 Accessing the Application

Once running, you can access:

- **API Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: http://localhost:3000/api-docs
- **API Info**: http://localhost:3000/api/info

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Password123!"
  }'
```

### 4. Create a Product (with JWT token)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest iPhone model",
    "price": 999.99,
    "category": "Electronics"
  }'
```

### 5. Get All Products
```bash
curl http://localhost:3000/api/products
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if SQL Server is running
netstat -an | findstr 1433

# Test connection with sqlcmd
sqlcmd -S localhost -U your_username -P your_password
```

#### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID your_process_id /F
```

#### Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Compilation Errors
```bash
# Clean build
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Environment-Specific Settings

#### Windows SQL Server Authentication
```env
# Windows Authentication (no username/password needed)
DB_USER=
DB_PASSWORD=
DB_OPTIONS_TRUSTED_CONNECTION=true
```

#### SQL Server Express Default Instance
```env
DB_SERVER=localhost\\SQLEXPRESS
```

#### LocalDB
```env
DB_SERVER=(localdb)\\MSSQLLocalDB
```

## 📊 Monitoring & Logs

### View Application Logs
```bash
# Logs are written to console in development
# Check the terminal where you ran npm run dev
```

### Database Monitoring
```sql
-- Check if tables exist
SELECT name FROM sys.tables;

-- Check stored procedures
SELECT name FROM sys.procedures;

-- View sample data
SELECT TOP 10 * FROM Products;
SELECT TOP 10 * FROM Users;
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- REST Client
- SQL Server (mssql)

### Useful npm Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test:watch   # Run tests in watch mode
```

## 📝 API Documentation

Visit http://localhost:3000/api-docs for interactive Swagger documentation where you can:
- View all available endpoints
- Test API requests directly
- See request/response schemas
- Try authentication flows

## 🎯 Next Steps

1. **Explore the API** using Swagger UI
2. **Run the test suite** to ensure everything works
3. **Modify the code** and see hot reload in action
4. **Add new features** following the existing patterns
5. **Deploy to cloud** when ready for production

## 💡 Tips

- Use the Swagger UI for easy API testing
- Check the logs for detailed error information
- All passwords are hashed with bcrypt
- JWT tokens expire in 24 hours by default
- The API includes rate limiting for security
- All endpoints return consistent JSON responses

Happy coding! 🎉