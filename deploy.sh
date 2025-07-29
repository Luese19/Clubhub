#!/bin/bash

# ClubHub Heroku Deployment Script

echo "🚀 Starting ClubHub deployment to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first."
    echo "   Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please log in to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Get app name from user
read -p "Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name cannot be empty"
    exit 1
fi

echo "📱 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME

echo "🔐 Setting environment variables..."
read -p "Enter your Gemini API Key: " GEMINI_KEY
read -p "Enter a secure JWT secret (or press Enter for auto-generated): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated JWT secret: $JWT_SECRET"
fi

heroku config:set \
    GEMINI_API_KEY="$GEMINI_KEY" \
    JWT_SECRET="$JWT_SECRET" \
    FRONTEND_URL="https://$APP_NAME.herokuapp.com" \
    NODE_ENV="production" \
    --app $APP_NAME

echo "📦 Building application..."
npm run build

echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
git push heroku main

echo "🗄️ Running database migrations..."
heroku run node server/dist/scripts/migrate.js --app $APP_NAME

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"
echo "📊 Health check: https://$APP_NAME.herokuapp.com/health"
echo ""
echo "📋 Useful commands:"
echo "   heroku logs --tail --app $APP_NAME"
echo "   heroku config --app $APP_NAME"
echo "   heroku pg:info --app $APP_NAME"
