export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
}

export interface ProductQuery {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  searchTerm?: string;
  sortBy?: 'name' | 'price' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: ProductResponse[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: {
    category?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export interface ProductStatistics {
  totalProducts: number;
  averagePrice: number;
  categories: CategoryStatistics[];
  priceRanges: PriceRangeStatistics[];
}

export interface CategoryStatistics {
  category: string;
  count: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface PriceRangeStatistics {
  range: string;
  count: number;
  percentage: number;
}

// Validation schemas for request validation
export interface ProductValidation {
  name: {
    required: true;
    minLength: 1;
    maxLength: 255;
  };
  description: {
    maxLength: 1000;
  };
  price: {
    required: true;
    min: 0;
    max: 999999.99;
  };
  category: {
    required: true;
    minLength: 1;
    maxLength: 100;
  };
}

// Database stored procedure input types
export interface GetProductsInput {
  PageNumber?: number;
  PageSize?: number;
  Category?: string | null;
  SearchTerm?: string | null;
}

export interface CreateProductInput {
  Name: string;
  Description?: string | null;
  Price: number;
  Category: string;
}

export interface UpdateProductInput {
  Id: number;
  Name: string;
  Description?: string | null;
  Price: number;
  Category: string;
}

export interface DeleteProductInput {
  Id: number;
}