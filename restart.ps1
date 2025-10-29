# 🔄 Скрипт перезапуска приложения
# Использование: .\restart.ps1

Write-Host "🛑 Остановка процессов на портах 3000 и 5000..." -ForegroundColor Yellow

# Найти и остановить процессы на порту 5000 (Backend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid5000 = $port5000 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pid5000) {
        Write-Host "Остановка процесса Backend (PID: $pid)" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# Найти и остановить процессы на порту 3000 (Frontend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $pid3000 = $port3000 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pid3000) {
        Write-Host "Остановка процесса Frontend (PID: $pid)" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

Write-Host "✅ Процессы остановлены" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Теперь запустите:" -ForegroundColor Cyan
Write-Host "  1. .\start-server.ps1  (в одном терминале)" -ForegroundColor White
Write-Host "  2. .\start-client.ps1  (в другом терминале)" -ForegroundColor White
Write-Host ""
Write-Host "Или используйте команды вручную:" -ForegroundColor Gray
Write-Host "  cd server; npm start" -ForegroundColor Gray
Write-Host "  cd client; npm start" -ForegroundColor Gray

