-- ===============================================
-- Products Demo API Database Schema
-- SQL Server Database Setup
-- ===============================================

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProductsDemo')
BEGIN
    CREATE DATABASE ProductsDemo;
END
GO

USE ProductsDemo;
GO

-- ===============================================
-- TABLES
-- ===============================================

-- Create Products table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Products] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [price] DECIMAL(18,2) NOT NULL CHECK (price >= 0),
        [category] NVARCHAR(100) NOT NULL,
        [createdAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [updatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        
        -- Indexes
        INDEX IX_Products_Category NONCLUSTERED ([category]),
        INDEX IX_Products_CreatedAt NONCLUSTERED ([createdAt]),
        INDEX IX_Products_Name NONCLUSTERED ([name])
    );
END
GO

-- Create Users table for authentication
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(50) UNIQUE NOT NULL,
        [email] NVARCHAR(255) UNIQUE NOT NULL,
        [passwordHash] NVARCHAR(255) NOT NULL,
        [createdAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [updatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        
        -- Indexes
        INDEX IX_Users_Username NONCLUSTERED ([username]),
        INDEX IX_Users_Email NONCLUSTERED ([email])
    );
END
GO

-- ===============================================
-- STORED PROCEDURES - PRODUCTS CRUD
-- ===============================================

-- Get all products with pagination and filtering
CREATE OR ALTER PROCEDURE [dbo].[GetProducts]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Category NVARCHAR(100) = NULL,
    @SearchTerm NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Get total count
    DECLARE @TotalCount INT;
    SELECT @TotalCount = COUNT(*)
    FROM [dbo].[Products]
    WHERE (@Category IS NULL OR [category] = @Category)
        AND (@SearchTerm IS NULL OR [name] LIKE '%' + @SearchTerm + '%' OR [description] LIKE '%' + @SearchTerm + '%');
    
    -- Get paginated results
    SELECT 
        [id],
        [name],
        [description],
        [price],
        [category],
        [createdAt],
        [updatedAt],
        @TotalCount AS TotalCount
    FROM [dbo].[Products]
    WHERE (@Category IS NULL OR [category] = @Category)
        AND (@SearchTerm IS NULL OR [name] LIKE '%' + @SearchTerm + '%' OR [description] LIKE '%' + @SearchTerm + '%')
    ORDER BY [createdAt] DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- Get product by ID
CREATE OR ALTER PROCEDURE [dbo].[GetProductById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [id],
        [name],
        [description],
        [price],
        [category],
        [createdAt],
        [updatedAt]
    FROM [dbo].[Products]
    WHERE [id] = @Id;
END
GO

-- Create new product
CREATE OR ALTER PROCEDURE [dbo].[CreateProduct]
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Price DECIMAL(18,2),
    @Category NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NewId INT;
    
    INSERT INTO [dbo].[Products] ([name], [description], [price], [category])
    VALUES (@Name, @Description, @Price, @Category);
    
    SET @NewId = SCOPE_IDENTITY();
    
    -- Return the newly created product
    EXEC [dbo].[GetProductById] @Id = @NewId;
END
GO

-- Update product
CREATE OR ALTER PROCEDURE [dbo].[UpdateProduct]
    @Id INT,
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Price DECIMAL(18,2),
    @Category NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [id] = @Id)
    BEGIN
        RAISERROR('Product not found', 16, 1);
        RETURN;
    END
    
    UPDATE [dbo].[Products]
    SET 
        [name] = @Name,
        [description] = @Description,
        [price] = @Price,
        [category] = @Category,
        [updatedAt] = GETUTCDATE()
    WHERE [id] = @Id;
    
    -- Return the updated product
    EXEC [dbo].[GetProductById] @Id = @Id;
END
GO

-- Delete product
CREATE OR ALTER PROCEDURE [dbo].[DeleteProduct]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if product exists
    IF NOT EXISTS (SELECT 1 FROM [dbo].[Products] WHERE [id] = @Id)
    BEGIN
        RAISERROR('Product not found', 16, 1);
        RETURN;
    END
    
    DELETE FROM [dbo].[Products] WHERE [id] = @Id;
    
    SELECT 'Product deleted successfully' AS Message;
END
GO

-- ===============================================
-- STORED PROCEDURES - USER AUTHENTICATION
-- ===============================================

-- Get user by username
CREATE OR ALTER PROCEDURE [dbo].[GetUserByUsername]
    @Username NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [id],
        [username],
        [email],
        [passwordHash],
        [createdAt],
        [updatedAt]
    FROM [dbo].[Users]
    WHERE [username] = @Username;
END
GO

-- Create new user
CREATE OR ALTER PROCEDURE [dbo].[CreateUser]
    @Username NVARCHAR(50),
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if username or email already exists
    IF EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [username] = @Username OR [email] = @Email)
    BEGIN
        RAISERROR('Username or email already exists', 16, 1);
        RETURN;
    END
    
    DECLARE @NewId INT;
    
    INSERT INTO [dbo].[Users] ([username], [email], [passwordHash])
    VALUES (@Username, @Email, @PasswordHash);
    
    SET @NewId = SCOPE_IDENTITY();
    
    -- Return the newly created user (without password hash)
    SELECT 
        [id],
        [username],
        [email],
        [createdAt],
        [updatedAt]
    FROM [dbo].[Users]
    WHERE [id] = @NewId;
END
GO

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Insert sample products
IF NOT EXISTS (SELECT 1 FROM [dbo].[Products])
BEGIN
    INSERT INTO [dbo].[Products] ([name], [description], [price], [category])
    VALUES 
        ('Laptop Pro 15"', 'High-performance laptop with 15-inch display, Intel i7 processor, 16GB RAM, 512GB SSD', 1299.99, 'Electronics'),
        ('Wireless Headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life', 299.99, 'Electronics'),
        ('Coffee Maker Deluxe', 'Programmable coffee maker with built-in grinder and thermal carafe', 149.99, 'Appliances'),
        ('Office Chair Pro', 'Ergonomic office chair with lumbar support and adjustable height', 249.99, 'Furniture'),
        ('Smartphone X', 'Latest smartphone with 5G capability, triple camera system, 128GB storage', 699.99, 'Electronics'),
        ('Desk Lamp LED', 'Modern LED desk lamp with adjustable brightness and USB charging port', 79.99, 'Furniture'),
        ('Protein Powder Vanilla', 'Premium whey protein powder, vanilla flavor, 2lbs container', 39.99, 'Health'),
        ('Yoga Mat Premium', 'Non-slip yoga mat with alignment guides, 6mm thickness', 49.99, 'Sports'),
        ('Kitchen Knife Set', 'Professional kitchen knife set with wooden block, 8 pieces', 129.99, 'Kitchen'),
        ('Bluetooth Speaker', 'Portable waterproof Bluetooth speaker with 12-hour battery', 89.99, 'Electronics');
END
GO

-- Insert sample user for testing
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users])
BEGIN
    -- Password: 'password123' hashed with bcrypt
    INSERT INTO [dbo].[Users] ([username], [email], [passwordHash])
    VALUES ('admin', 'admin@example.com', '$2b$10$YourHashedPasswordHere');
END
GO

PRINT 'Database schema and stored procedures created successfully!';
PRINT 'Sample data inserted.';