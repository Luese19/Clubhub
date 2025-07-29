#!/bin/bash
# ClubHub Heroku Quick Setup Script

echo "🚀 ClubHub Heroku Quick Setup"
echo "=============================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login to Heroku
echo "🔐 Logging into Heroku..."
heroku login

# Create Heroku app
echo ""
read -p "📝 Enter your app name (or press Enter for auto-generated): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "🏗️  Creating Heroku app with auto-generated name..."
    heroku create
else
    echo "🏗️  Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
fi

# Add PostgreSQL addon
echo "🗄️  Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
echo "🔧 Setting up environment variables..."
echo ""
read -p "🔑 Enter your JWT secret (min 32 characters): " JWT_SECRET
read -p "🤖 Enter your Gemini API key (optional): " GEMINI_API_KEY

heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="$JWT_SECRET"

if [ ! -z "$GEMINI_API_KEY" ]; then
    heroku config:set GEMINI_API_KEY="$GEMINI_API_KEY"
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add and commit files
echo "📝 Preparing files for deployment..."
git add .
git commit -m "Initial setup for Heroku deployment"

# Deploy
echo "🚀 Deploying to Heroku..."
git push heroku main

echo ""
echo "✅ Setup complete!"
echo "🌐 Your app should be available at: $(heroku info -s | grep web_url | cut -d= -f2)"
echo ""
echo "📊 Useful commands:"
echo "   heroku logs --tail    # View real-time logs"
echo "   heroku ps             # Check app status"
echo "   heroku open           # Open your app"
echo "   heroku restart        # Restart your app"
