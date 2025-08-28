import sql from 'mssql';
import { databaseConfig } from './database.config';
import { DatabaseResult, StoredProcedureInput } from './database.types';
import { logger } from '../utils/logger';

class DatabaseConnection {
  private pool: sql.ConnectionPool | null = null;
  private connecting = false;

  /**
   * Initialize database connection pool
   */
  public async connect(): Promise<void> {
    if (this.pool && this.pool.connected) {
      return;
    }

    if (this.connecting) {
      // Wait for existing connection attempt
      while (this.connecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.connecting = true;
      logger.info('Connecting to SQL Server database...');
      
      this.pool = new sql.ConnectionPool(databaseConfig);
      
      this.pool.on('error', (error: Error) => {
        logger.error('Database pool error:', error);
      });

      await this.pool.connect();
      logger.info('Successfully connected to SQL Server database');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.connecting = false;
    }
  }

  /**
   * Get database connection pool
   */
  public async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool || !this.pool.connected) {
      await this.connect();
    }
    
    if (!this.pool) {
      throw new Error('Database connection pool is not available');
    }
    
    return this.pool;
  }

  /**
   * Execute stored procedure
   */
  public async executeStoredProcedure<T = any>(
    procedureName: string,
    inputs?: StoredProcedureInput
  ): Promise<DatabaseResult<T>> {
    try {
      const pool = await this.getPool();
      const request = pool.request();

      // Add input parameters if provided
      if (inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
          request.input(key, this.getSqlType(value), value);
        });
      }

      logger.debug(`Executing stored procedure: ${procedureName}`, inputs);
      const result = await request.execute(procedureName);
      
      return {
        recordset: result.recordset,
        recordsets: result.recordsets,
        output: result.output,
        rowsAffected: result.rowsAffected,
      };
    } catch (error) {
      logger.error(`Error executing stored procedure ${procedureName}:`, error);
      throw new Error(`Stored procedure execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute raw SQL query
   */
  public async executeQuery<T = any>(
    query: string,
    inputs?: Record<string, any>
  ): Promise<DatabaseResult<T>> {
    try {
      const pool = await this.getPool();
      const request = pool.request();

      // Add input parameters if provided
      if (inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
          request.input(key, this.getSqlType(value), value);
        });
      }

      logger.debug(`Executing query: ${query}`, inputs);
      const result = await request.query(query);
      
      return {
        recordset: result.recordset,
        recordsets: result.recordsets,
        output: result.output,
        rowsAffected: result.rowsAffected,
      };
    } catch (error) {
      logger.error(`Error executing query: ${query}`, error);
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Begin transaction
   */
  public async beginTransaction(): Promise<sql.Transaction> {
    try {
      const pool = await this.getPool();
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      return transaction;
    } catch (error) {
      logger.error('Error beginning transaction:', error);
      throw new Error(`Transaction begin failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check database connection health
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1 as HealthCheck');
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection:', error);
      } finally {
        this.pool = null;
      }
    }
  }

  /**
   * Get appropriate SQL data type for JavaScript value
   */
  private getSqlType(value: any): any {
    if (value === null || value === undefined) {
      return sql.NVarChar;
    }

    switch (typeof value) {
      case 'string':
        return sql.NVarChar;
      case 'number':
        return Number.isInteger(value) ? sql.Int : sql.Decimal(18, 2);
      case 'boolean':
        return sql.Bit;
      case 'object':
        if (value instanceof Date) {
          return sql.DateTime2;
        }
        return sql.NVarChar;
      default:
        return sql.NVarChar;
    }
  }
}

// Export singleton instance
export const dbConnection = new DatabaseConnection();

// Export types and classes for use in other modules
export { sql };
export type { DatabaseResult, StoredProcedureInput };