# 🔄 Скрипт перезапуска только сервера
# Использование: .\restart-server.ps1

Write-Host "🛑 Остановка сервера на порту 5000..." -ForegroundColor Yellow

# Найти и остановить процессы на порту 5000 (Backend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid5000 = $port5000 | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $pid5000) {
        Write-Host "Остановка процесса Backend (PID: $processId)" -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "Процесс на порту 5000 не найден" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

Write-Host "🚀 Запуск сервера..." -ForegroundColor Green
Set-Location server
npm start
Set-Location ..

