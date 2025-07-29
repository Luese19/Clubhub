// Quick script to find your admin user
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com') ? { rejectUnauthorized: false } : false,
});

async function findAdmin() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    // Get all users ordered by creation date
    const result = await pool.query(`
      SELECT id, email, role, organization_id, created_at 
      FROM users 
      ORDER BY created_at ASC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      console.log('💡 The next user to sign up will become the admin');
      return;
    }
    
    console.log('📊 All Users:');
    console.log('═══════════════════════════════════════════════════════');
    
    result.rows.forEach((user, index) => {
      const isAdmin = user.role === 'admin';
      const icon = isAdmin ? '👑' : '👤';
      const status = isAdmin ? 'ADMIN' : 'STUDENT';
      
      console.log(`${icon} ${status}: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Organization: ${user.organization_id || 'None'}`);
      
      if (index === 0 && isAdmin) {
        console.log('   ⭐ This is your SUPER ADMIN (first user)');
      }
      
      console.log('');
    });
    
    const adminUsers = result.rows.filter(user => user.role === 'admin');
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found!');
      console.log('💡 Something might be wrong with the user creation logic');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s)`);
      console.log('👑 Super Admin Details:');
      console.log(`   Email: ${adminUsers[0].email}`);
      console.log(`   ID: ${adminUsers[0].id}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

findAdmin();
