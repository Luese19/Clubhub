import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { query } from '../database';
import { User, UserRole } from '../types';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Generate JWT token
const generateToken = (user: { id: string; email: string; role: UserRole; organizationId: string | null }) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Sign up
router.post('/signup', async (req, res) => {
  const startTime = Date.now();
  console.log('🚀 Signup request received at', new Date().toISOString());
  
  try {
    // Validate input
    const { error } = signupSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    console.log('📝 Processing signup for email:', email);

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUserStart = Date.now();
    
    try {
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      console.log(`✅ User existence check completed in ${Date.now() - existingUserStart}ms`);
      
      if (existingUser.rows.length > 0) {
        console.log('❌ User already exists');
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
    } catch (dbError: any) {
      console.error('❌ Database error during user existence check:', dbError.message);
      
      if (dbError.code === '42P01') {
        return res.status(500).json({ error: 'Database not properly initialized. Please run migrations.' });
      }
      
      return res.status(500).json({ error: 'Database connection error. Please try again later.' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashStart = Date.now();
    const passwordHash = await bcrypt.hash(password, 12);
    console.log(`✅ Password hashing completed in ${Date.now() - hashStart}ms`);

    // Check if this is the first user (they become admin)
    console.log('👥 Checking user count for role assignment...');
    const userCountStart = Date.now();
    
    let role: UserRole = 'student'; // Default role
    
    try {
      const userCount = await query('SELECT COUNT(*) FROM users');
      console.log(`✅ User count check completed in ${Date.now() - userCountStart}ms`);
      role = parseInt(userCount.rows[0].count) === 0 ? 'admin' : 'student';
      console.log('🎭 Assigned role:', role);
    } catch (dbError: any) {
      console.error('⚠️ Failed to check user count, defaulting to student role:', dbError.message);
      // Continue with default role
    }

    // Create user
    console.log('👤 Creating user...');
    const createUserStart = Date.now();
    
    try {
      const result = await query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, organization_id',
        [email, passwordHash, role]
      );
      
      console.log(`✅ User creation completed in ${Date.now() - createUserStart}ms`);

      if (!result.rows[0]) {
        throw new Error('Failed to create user - no data returned');
      }

      const user = result.rows[0];
      console.log('🎉 User created successfully:', { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organization_id 
      });

      // Generate JWT token
      console.log('🔑 Generating JWT token...');
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      });

      const totalTime = Date.now() - startTime;
      console.log(`✅ Signup completed successfully in ${totalTime}ms`);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
        },
        token,
      });
      
    } catch (dbError: any) {
      console.error('❌ Database error during user creation:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
      });
      
      if (dbError.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }
    
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Signup failed after ${totalTime}ms:`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
    });
    
    // Provide appropriate error responses
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Database connection failed. Please try again later.' });
    }
    
    if (error.code === '28000') {
      return res.status(500).json({ error: 'Database authentication error. Please contact support.' });
    }
    
    if (error.code === '42P01') {
      return res.status(500).json({ error: 'Database not properly initialized. Please contact support.' });
    }
    
    // Generic error for any other cases
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, role, organization_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
