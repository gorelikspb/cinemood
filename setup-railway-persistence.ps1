# Railway Persistent Storage Setup Script
# Run this after: railway login

Write-Host "🚀 Setting up Railway Persistent Storage..." -ForegroundColor Cyan

# Check if Railway CLI is installed
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Please install it first: npm i -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Check if logged in
Write-Host "🔍 Checking Railway login status..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Railway. Please run: railway login" -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green

# Link to project if not already linked
Write-Host "🔗 Checking project link..." -ForegroundColor Yellow
railway link 2>&1 | Out-Null

# Get service ID
Write-Host "📋 Getting service information..." -ForegroundColor Yellow
$services = railway service list --json | ConvertFrom-Json
if ($services.Count -eq 0) {
    Write-Host "❌ No services found. Make sure your project is linked." -ForegroundColor Red
    exit 1
}

$service = $services[0]
Write-Host "✅ Using service: $($service.name) ($($service.id))" -ForegroundColor Green

# Check if volume already exists
Write-Host "🔍 Checking for existing volumes..." -ForegroundColor Yellow
$volumes = railway volume list --service $service.id --json 2>&1 | ConvertFrom-Json
$existingVolume = $volumes | Where-Object { $_.mountPath -eq "/data" }

if ($existingVolume) {
    Write-Host "✅ Volume already exists at /data" -ForegroundColor Green
} else {
    Write-Host "➕ Creating volume at /data..." -ForegroundColor Yellow
    railway volume add --service $service.id --mount-path "/data"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Volume created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create volume" -ForegroundColor Red
        exit 1
    }
}

# Set DATABASE_PATH environment variable
Write-Host "🔧 Setting DATABASE_PATH environment variable..." -ForegroundColor Yellow
railway variables --set "DATABASE_PATH=/data/database.sqlite" --service $service.id

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ DATABASE_PATH variable set successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set DATABASE_PATH variable" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup complete! Railway will automatically restart your service." -ForegroundColor Green
Write-Host "📝 Check logs to verify database path: /data/database.sqlite" -ForegroundColor Cyan

