# 🎨 Скрипт запуска Frontend клиента
# Использование: .\start-client.ps1

Write-Host "🚀 Запуск Frontend клиента..." -ForegroundColor Green

Set-Location $PSScriptRoot
Set-Location client

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    npm install
}

Write-Host "🎨 Запуск клиента на порту 3000..." -ForegroundColor Cyan
npm start

