const { Pool } = require('pg');
require('dotenv').config();

console.log('Database URL from env:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  console.log('Testing database connection...');
  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);
    
    client.release();
    
    // Test creating a simple table to verify permissions
    const testResult = await pool.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY)');
    console.log('✅ Table creation test successful');
    
    await pool.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Table cleanup successful');
    
  } catch (error) {
    console.error('❌ Database connection failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - database server may be down or unreachable');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Host not found - check your DATABASE_URL');
    } else if (error.code === '28000') {
      console.error('Authentication failed - check your database credentials');
    }
  } finally {
    await pool.end();
    console.log('Connection closed');
  }
}

testConnection();
