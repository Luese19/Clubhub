import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔍 Database connection string configured');

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('amazonaws.com') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pool configuration
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Connection event handlers
pool.on('connect', (client: PoolClient) => {
  console.log('✅ New database connection established');
});

pool.on('error', (err: Error) => {
  console.error('❌ Database pool error:', err.message);
});

pool.on('remove', () => {
  console.log('🔄 Database connection removed from pool');
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  let client: PoolClient | null = null;
  
  try {
    console.log('🔍 Acquiring database connection...');
    client = await pool.connect();
    console.log('✅ Database connection acquired');
    
    console.log('📝 Executing query:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('📊 Query parameters:', params);
    
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    console.log(`✅ Query completed in ${duration}ms, returned ${result.rowCount} rows`);
    return result;
    
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`❌ Query failed after ${duration}ms:`, {
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params,
      error: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    
    // Provide more specific error messages
    if (error.code === '23505') {
      error.message = 'A record with this information already exists';
    } else if (error.code === '23503') {
      error.message = 'Referenced record does not exist';
    } else if (error.code === '42P01') {
      error.message = 'Table does not exist - run database migration';
    } else if (error.code === 'ECONNREFUSED') {
      error.message = 'Database connection refused - server may be down';
    } else if (error.code === 'ENOTFOUND') {
      error.message = 'Database host not found - check DATABASE_URL';
    } else if (error.code === '28000') {
      error.message = 'Database authentication failed - check credentials';
    }
    
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('🔄 Database connection released');
    }
  }
};

export const getClient = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Direct database client acquired');
    return client;
  } catch (error) {
    console.error('❌ Failed to acquire database client:', error);
    throw error;
  }
};

// Test connection function with timeout
export const testConnection = async (timeoutMs: number = 10000): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      console.error('❌ Database connection test timed out');
      resolve(false);
    }, timeoutMs);
    
    try {
      console.log('🔍 Testing database connection...');
      const result = await query('SELECT NOW() as current_time, version() as db_version');
      
      if (result.rows[0]) {
        console.log('✅ Database connection successful:', {
          time: result.rows[0].current_time,
          version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1],
        });
        clearTimeout(timeout);
        resolve(true);
      } else {
        console.error('❌ Database connection test returned no data');
        clearTimeout(timeout);
        resolve(false);
      }
    } catch (error: any) {
      console.error('❌ Database connection test failed:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
      });
      clearTimeout(timeout);
      resolve(false);
    }
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

export default pool;
