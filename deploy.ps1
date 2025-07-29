# ClubHub Heroku Deployment Script for Windows PowerShell

Write-Host "🚀 Starting ClubHub deployment to Heroku..." -ForegroundColor Green

# Check if Heroku CLI is installed
try {
    heroku --version | Out-Null
} catch {
    Write-Host "❌ Heroku CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Visit: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Heroku
try {
    heroku auth:whoami | Out-Null
} catch {
    Write-Host "❌ Please log in to Heroku first:" -ForegroundColor Red
    Write-Host "   heroku login" -ForegroundColor Yellow
    exit 1
}

# Get app name from user
$APP_NAME = Read-Host "Enter your Heroku app name"

if ([string]::IsNullOrWhiteSpace($APP_NAME)) {
    Write-Host "❌ App name cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host "📱 Creating Heroku app: $APP_NAME" -ForegroundColor Blue
heroku create $APP_NAME

Write-Host "🗄️ Adding PostgreSQL database..." -ForegroundColor Blue
heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME

Write-Host "🔐 Setting environment variables..." -ForegroundColor Blue
$GEMINI_KEY = Read-Host "Enter your Gemini API Key"
$JWT_SECRET = Read-Host "Enter a secure JWT secret (or press Enter for auto-generated)"

if ([string]::IsNullOrWhiteSpace($JWT_SECRET)) {
    # Generate a random JWT secret
    $JWT_SECRET = -join ((1..32) | ForEach {Get-Random -Input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})
    Write-Host "Generated JWT secret: $JWT_SECRET" -ForegroundColor Yellow
}

heroku config:set GEMINI_API_KEY="$GEMINI_KEY" JWT_SECRET="$JWT_SECRET" FRONTEND_URL="https://$APP_NAME.herokuapp.com" NODE_ENV="production" --app $APP_NAME

Write-Host "📦 Building application..." -ForegroundColor Blue
npm run build

Write-Host "🚀 Deploying to Heroku..." -ForegroundColor Blue
git add .
git commit -m "Deploy to Heroku"
git push heroku main

Write-Host "🗄️ Running database migrations..." -ForegroundColor Blue
heroku run node server/dist/scripts/migrate.js --app $APP_NAME

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://$APP_NAME.herokuapp.com" -ForegroundColor Cyan
Write-Host "📊 Health check: https://$APP_NAME.herokuapp.com/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Yellow
Write-Host "   heroku logs --tail --app $APP_NAME"
Write-Host "   heroku config --app $APP_NAME"
Write-Host "   heroku pg:info --app $APP_NAME"
