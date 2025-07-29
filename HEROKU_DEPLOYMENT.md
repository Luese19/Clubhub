# 🚀 ClubHub Heroku Deployment Guide

This guide will help you deploy your ClubHub application to Heroku with both frontend and backend.

## 📋 Prerequisites

1. **Install Heroku CLI**: [Download here](https://devcenter.heroku.com/articles/heroku-cli)
2. **Git**: Make sure Git is installed and your project is in a Git repository
3. **Heroku Account**: Create a free account at [heroku.com](https://heroku.com)

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# Navigate to your project directory
cd d:\clubhub

# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit for Heroku deployment"
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku Application

```bash
# Create a new Heroku app (replace 'your-clubhub-app' with your desired name)
heroku create your-clubhub-app

# Or let Heroku generate a random name
heroku create
```

### Step 4: Add PostgreSQL Database

```bash
# Add PostgreSQL addon (free tier)
heroku addons:create heroku-postgresql:essential-0

# Get database URL (save this for later)
heroku config:get DATABASE_URL
```

### Step 5: Set Environment Variables

```bash
# Set environment variables for your app
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
heroku config:set GEMINI_API_KEY=your-gemini-api-key
heroku config:set PORT=3001

# The DATABASE_URL is automatically set by the PostgreSQL addon
```

### Step 6: Configure Build Settings

Your `package.json` already has the correct scripts:
- ✅ `heroku-postbuild` script is configured
- ✅ `start` script points to server
- ✅ Build scripts are set up

### Step 7: Deploy to Heroku

```bash
# Add Heroku as a remote
git remote add heroku https://git.heroku.com/your-app-name.git

# Push to Heroku (this will trigger the build)
git push heroku main

# If your default branch is 'master':
git push heroku master
```

### Step 8: Initialize Database

```bash
# Run database migrations
heroku run npm run migrate

# Or connect to your database and run setup scripts
heroku pg:psql
```

### Step 9: Open Your App

```bash
# Open your deployed app
heroku open

# Or check logs if there are issues
heroku logs --tail
```

## 🔧 Configuration Files

### Required Files (Already Present):

1. **`Procfile`** ✅
   ```
   web: cd server && npm start
   ```

2. **Root `package.json`** ✅
   - Contains `heroku-postbuild` script
   - Builds both client and server

3. **Server `package.json`** ✅
   - Contains start script
   - All dependencies listed

## 🌐 Environment Variables Setup

Set these in Heroku Dashboard or via CLI:

```bash
# Required variables
heroku config:set JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
heroku config:set NODE_ENV="production"
heroku config:set GEMINI_API_KEY="your-gemini-api-key"

# Optional: Custom port (defaults to what Heroku assigns)
heroku config:set PORT=3001
```

## 📁 File Structure for Heroku

Your project structure is already Heroku-ready:

```
clubhub/
├── package.json          # Root package.json with heroku-postbuild
├── Procfile             # Tells Heroku how to start your app
├── vite.config.ts       # Frontend build config
├── src/                 # Frontend React code
├── server/
│   ├── package.json     # Server dependencies
│   ├── src/             # Backend Node.js code
│   └── dist/            # Built server code (after build)
└── dist/                # Built frontend code (after build)
```

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:
   ```bash
   heroku logs --tail
   # Check for missing dependencies or build errors
   ```

2. **App Crashes on Start**:
   ```bash
   heroku ps
   heroku logs --tail
   # Usually database connection or environment variable issues
   ```

3. **Database Connection Issues**:
   ```bash
   # Check if PostgreSQL addon is attached
   heroku addons
   
   # Verify DATABASE_URL is set
   heroku config:get DATABASE_URL
   ```

4. **Frontend Not Loading**:
   - Make sure `npm run build:client` runs successfully
   - Check that static files are being served by your Express server

### Useful Heroku Commands:

```bash
# View app status
heroku ps

# View logs in real-time
heroku logs --tail

# Restart your app
heroku restart

# Open a bash session on your dyno
heroku run bash

# Run database migrations
heroku run npm run migrate

# Check environment variables
heroku config
```

## 🔄 Updates and Redeployment

When you make changes:

```bash
# Commit your changes
git add .
git commit -m "Your update message"

# Push to Heroku (will trigger automatic rebuild)
git push heroku main
```

## 📊 Monitoring

- **Heroku Dashboard**: Monitor your app's performance
- **Logs**: `heroku logs --tail` for real-time logging
- **Metrics**: Available in Heroku dashboard

## 💰 Cost Considerations

- **Free Tier**: Limited hours per month
- **Hobby Tier**: $7/month for 24/7 uptime
- **PostgreSQL**: Essential-0 plan is free with 10,000 rows

## 🔒 Security Notes

- Never commit sensitive environment variables
- Use strong JWT secrets (minimum 32 characters)
- Keep your database credentials secure
- Regularly update dependencies

Your ClubHub app should now be live on Heroku! 🎉
