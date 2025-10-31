# Reset all Cinemood data script
# Stops servers, clears database and provides instructions for localStorage

Write-Host "Stopping servers..." -ForegroundColor Yellow

# Stop processes on ports 3000 and 5000
$ports = @(3000, 5000)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId) {
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "   Stopped process on port $port (PID: $processId)" -ForegroundColor Green
                } catch {
                    Write-Host "   Failed to stop process on port $port" -ForegroundColor Yellow
                }
            }
        }
    }
}

Write-Host "`nWaiting 2 seconds for resources to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Clear database
Write-Host "`nClearing database..." -ForegroundColor Yellow
Set-Location server
if (Test-Path "database.sqlite") {
    try {
        Remove-Item "database.sqlite" -Force
        Write-Host "   Database deleted" -ForegroundColor Green
        
        # Recreate database
        node reset-db.js
        Write-Host "   Database recreated" -ForegroundColor Green
    } catch {
        Write-Host "   Error deleting database: $_" -ForegroundColor Red
        Write-Host "   Make sure server is stopped!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Database not found, creating new one..." -ForegroundColor Cyan
    node reset-db.js
}

Set-Location ..

Write-Host "`nOpening localStorage cleaner in browser..." -ForegroundColor Green
Start-Sleep -Seconds 2

# Try to open the localStorage cleaner page
try {
    Start-Process "http://localhost:3000/clear-localstorage.html"
    Write-Host "✅ Opened localStorage cleaner page in browser" -ForegroundColor Green
    Write-Host "`nClick 'Clear All Cinemood Data' button to clear watchlist and all app data" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️ Could not open browser automatically" -ForegroundColor Yellow
    Write-Host "`nPlease manually open:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000/clear-localstorage.html" -ForegroundColor White
}
