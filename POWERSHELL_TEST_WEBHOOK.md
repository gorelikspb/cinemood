# 🧪 ТЕСТ Google Sheets Webhook в PowerShell

## Правильная команда для PowerShell:

Скопируйте **ВСЮ команду целиком** и замените `ВАШ_URL` на ваш реальный URL:

```powershell
$body = @{email="test@example.com";timestamp="2024-01-15T12:00:00Z";source="test";deviceType="desktop";browser="Chrome";os="Windows";language="en";screenWidth=1920;screenHeight=1080} | ConvertTo-Json; Invoke-RestMethod -Uri "ВАШ_URL_С_/exec" -Method Post -Body $body -ContentType "application/json"
```

Или **многострочный вариант** (каждая строка отдельно):

```powershell
$body = @{
    email = "test@example.com"
    timestamp = "2024-01-15T12:00:00Z"
    source = "test"
    deviceType = "desktop"
    browser = "Chrome"
    os = "Windows"
    language = "en"
    screenWidth = 1920
    screenHeight = 1080
} | ConvertTo-Json

Invoke-RestMethod -Uri "ВАШ_URL_С_/exec" -Method Post -Body $body -ContentType "application/json"
```

## Пример с реальным URL:

```powershell
$body = @{
    email = "test@example.com"
    timestamp = "2024-01-15T12:00:00Z"
    source = "test"
    deviceType = "desktop"
    browser = "Chrome"
    os = "Windows"
    language = "en"
    screenWidth = 1920
    screenHeight = 1080
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfyc.../exec" -Method Post -Body $body -ContentType "application/json"
```

## Что должно произойти:

✅ Если всё работает:
- Вернется: `{"success": true}`
- В Google Sheets появится новая строка с email

❌ Если ошибка:
- Проверьте URL (должен заканчиваться на `/exec`)
- Проверьте права доступа в Google Apps Script

