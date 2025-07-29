# ClubHub - Full Stack Deployment Guide

ClubHub is a comprehensive school club management platform with authentication, events, projects, and more.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT tokens
- **Deployment**: Heroku

## 🚀 Heroku Deployment

### Prerequisites
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a Heroku account

### Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create Heroku App
```bash
heroku create your-app-name
```

### Step 3: Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:essential-0
```

### Step 4: Set Environment Variables
```bash
# Set a secure JWT secret
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-here"

# Set your Gemini API key
heroku config:set GEMINI_API_KEY="your-gemini-api-key"

# Set frontend URL (replace with your Heroku app URL)
heroku config:set FRONTEND_URL="https://your-app-name.herokuapp.com"
```

### Step 5: Deploy
```bash
git push heroku main
```

### Step 6: Run Database Migrations
```bash
heroku run node server/dist/scripts/migrate.js
```

## 🔧 Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm

### Setup
1. **Clone and install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment files:**
   ```bash
   # Copy example files
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Configure database:**
   - Create a PostgreSQL database named `clubhub`
   - Update `server/.env` with your database URL

4. **Run migrations:**
   ```bash
   cd server
   npm run migrate
   ```

5. **Start development servers:**
   ```bash
   # Run both frontend and backend
   npm run dev:full
   
   # Or run separately:
   npm run dev          # Frontend only
   npm run dev:server   # Backend only
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in user

### Protected Routes (require authentication)
- Organizations, Events, Projects, etc. (to be implemented)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Joi

## 📱 Frontend Features

- Terminal-style UI design
- Real-time authentication
- Responsive design
- Loading states and error handling

## 🎯 Production Considerations

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use Heroku Postgres or another production database
3. **SSL**: Heroku provides SSL certificates automatically
4. **Monitoring**: Consider adding logging and monitoring services
5. **Backup**: Set up database backups

## 🛠️ Troubleshooting

### Common Issues

1. **Build fails on Heroku**
   - Check that all dependencies are in `dependencies`, not `devDependencies`
   - Ensure Node.js version compatibility

2. **Database connection errors**
   - Verify DATABASE_URL is set correctly
   - Check that migrations have been run

3. **Authentication not working**
   - Verify JWT_SECRET is set
   - Check CORS configuration

### Heroku Logs
```bash
heroku logs --tail
```

## 📄 License

This project is licensed under the MIT License.
