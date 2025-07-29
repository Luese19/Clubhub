import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import debugRoutes from './routes/debug';
import organizationRoutes from './routes/organizations';
import { testConnection } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../../../dist');
  console.log('Static files path:', distPath);
  app.use(express.static(distPath));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/organizations', organizationRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.resolve(__dirname, '../../../dist/index.html');
    console.log('Index.html path:', indexPath);
    
    // Check if file exists before sending
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('Index.html not found at:', indexPath);
      res.status(404).json({ error: 'Application not found. Please check if the build exists.' });
    }
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for non-production
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Current directory: ${process.cwd()}`);
  console.log(`🔍 __dirname: ${__dirname}`);
  
  // Test database connection with timeout
  console.log('🔍 Testing database connection...');
  try {
    const dbConnected = await testConnection(15000); // 15 second timeout
    if (dbConnected) {
      console.log('✅ Database connection successful - server ready');
    } else {
      console.error('❌ Database connection failed - server will continue but signup may not work');
      console.error('📋 Please check:');
      console.error('   1. DATABASE_URL environment variable is correct');
      console.error('   2. Database server is running and accessible');
      console.error('   3. Network connectivity to database');
      console.error('   4. Database credentials are valid');
    }
  } catch (error) {
    console.error('❌ Database connection test threw error:', error);
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 App: http://localhost:${PORT}`);
    const distPath = path.resolve(__dirname, '../../../dist');
    console.log(`🔍 Checking dist path: ${distPath}`);
    console.log(`🔍 Dist exists: ${fs.existsSync(distPath)}`);
    if (fs.existsSync(distPath)) {
      console.log(`🔍 Dist contents:`, fs.readdirSync(distPath));
    }
  }
  
  console.log('📡 API endpoints available:');
  console.log(`   POST ${PORT === 3001 ? 'http://localhost:3001' : ''}/api/auth/signup`);
  console.log(`   POST ${PORT === 3001 ? 'http://localhost:3001' : ''}/api/auth/signin`);
  console.log(`   GET  ${PORT === 3001 ? 'http://localhost:3001' : ''}/health`);
});

export default app;
