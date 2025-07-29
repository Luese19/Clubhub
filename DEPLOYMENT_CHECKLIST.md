# 📋 ClubHub Heroku Deployment Checklist

## ✅ Pre-Deployment Checklist

### Required Files (Already Present):
- [x] `Procfile` - Tells Heroku how to start your app
- [x] `package.json` - Root package with heroku-postbuild script
- [x] `server/package.json` - Server dependencies and start script
- [x] `vite.config.ts` - Frontend build configuration
- [x] Environment variable examples

### Code Preparation:
- [ ] All changes committed to Git
- [ ] Database migrations ready
- [ ] Environment variables identified
- [ ] Build scripts tested locally (`npm run build`)

## 🚀 Deployment Steps

### 1. Install Prerequisites
```bash
# Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Verify installation
heroku --version
git --version
```

### 2. Login and Create App
```bash
heroku login
heroku create your-clubhub-app-name
```

### 3. Add Database
```bash
heroku addons:create heroku-postgresql:essential-0
```

### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-32-character-secret-key"
heroku config:set GEMINI_API_KEY="your-gemini-key" # optional
```

### 5. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 6. Initialize Database
```bash
heroku run npm run migrate
```

### 7. Test
```bash
heroku open
heroku logs --tail
```

## 🔧 Quick Commands

### Deployment:
```bash
# Use the provided script (Windows)
.\deploy.ps1

# Or use the setup script (Unix/Mac)
chmod +x heroku-setup.sh
./heroku-setup.sh
```

### Manual Commands:
```bash
# View app status
heroku ps

# View logs
heroku logs --tail

# Restart app
heroku restart

# Open app
heroku open

# Run database migrations
heroku run npm run migrate

# Access database
heroku pg:psql
```

## 🐛 Troubleshooting

### Build Issues:
1. Check `heroku logs --tail` for build errors
2. Ensure all dependencies are in package.json
3. Verify build scripts work locally

### Runtime Issues:
1. Check environment variables: `heroku config`
2. Verify database connection
3. Check server.ts for correct static file serving

### Database Issues:
1. Verify PostgreSQL addon: `heroku addons`
2. Check DATABASE_URL: `heroku config:get DATABASE_URL`
3. Run migrations: `heroku run npm run migrate`

## 📊 Monitoring

- **Dashboard**: https://dashboard.heroku.com/apps/your-app-name
- **Logs**: `heroku logs --tail`
- **Database**: `heroku pg:info`
- **Metrics**: Available in Heroku dashboard

## 💡 Tips

1. **First deployment** may take 5-10 minutes
2. **Free tier** apps sleep after 30 minutes of inactivity
3. **Database** has 10,000 row limit on free tier
4. **Use environment variables** for all secrets
5. **Monitor logs** during and after deployment

## 🔄 Updating Your App

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push heroku main

# App will automatically rebuild and restart
```

Your ClubHub app should be live at: `https://your-app-name.herokuapp.com` 🎉
