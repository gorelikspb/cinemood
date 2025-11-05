# Netlify Environment Variables Setup Script
# Автоматически добавляет переменные окружения в Netlify

Write-Host "🔧 Настройка переменных окружения в Netlify..." -ForegroundColor Cyan

# Проверяем, установлен ли Netlify CLI
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue

if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI не установлен!" -ForegroundColor Red
    Write-Host "Установите: npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "Затем запустите: netlify login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Netlify CLI найден" -ForegroundColor Green

# Переменные для добавления
$envVars = @{
    "REACT_APP_API_URL" = "https://cinemood-production.up.railway.app/api"
    "REACT_APP_GA4_MEASUREMENT_ID" = "G-4B5R6S0DLK"
    # "REACT_APP_CLARITY_PROJECT_ID" = "ваш-project-id"  # Раскомментируйте и добавьте свой ID
}

Write-Host "`n📋 Добавляю переменные окружения..." -ForegroundColor Cyan

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  Добавляю: $key = $value" -ForegroundColor Yellow
    
    try {
        # Добавляем переменную для production
        netlify env:set $key $value --context production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $key добавлена успешно" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Возможно, нужно войти: netlify login" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Ошибка при добавлении $key : $_" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Готово!" -ForegroundColor Green
Write-Host "`n📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Проверьте переменные в Netlify Dashboard: Site settings → Environment variables" -ForegroundColor White
Write-Host "2. Пересоберите проект: Deploys → Trigger deploy → Deploy site" -ForegroundColor White
Write-Host "3. Или сделайте: netlify deploy --prod" -ForegroundColor White

