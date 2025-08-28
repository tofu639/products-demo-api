export interface DatabaseConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  port?: number;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
    connectionTimeout: number;
    requestTimeout: number;
    pool: {
      max: number;
      min: number;
      idleTimeoutMillis: number;
    };
  };
}

export interface DatabaseResult<T = any> {
  recordset: T[];
  recordsets: T[][];
  output: Record<string, any>;
  rowsAffected: number[];
}

export interface StoredProcedureInput {
  [key: string]: any;
}

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}