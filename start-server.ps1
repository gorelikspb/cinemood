# 🎬 Скрипт запуска Backend сервера
# Использование: .\start-server.ps1

Write-Host "🚀 Запуск Backend сервера..." -ForegroundColor Green

Set-Location $PSScriptRoot
Set-Location server

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    npm install
}

Write-Host "🎬 Запуск сервера на порту 5000..." -ForegroundColor Cyan
npm start

