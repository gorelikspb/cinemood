# 🧪 ТЕСТИРОВАНИЕ Google Apps Script БЕЗ Railway

## Способ 1: Тест через браузер (GET запрос)

Если вы добавили функцию `doGet` (см. инструкцию выше), можно просто открыть URL в браузере:

1. Скопируйте ваш Web App URL (который заканчивается на `/exec`)
2. Откройте его в браузере
3. Должно показать:
   ```json
   {
     "message": "Google Sheets Webhook is working!",
     "status": "ready",
     "note": "This endpoint accepts POST requests only"
   }
   ```

Если видите это сообщение → скрипт работает! ✅

---

## Способ 2: Тест через Apps Script редактор (POST запрос)

1. Откройте Google Sheets → **Extensions** → **Apps Script**
2. В редакторе кода вверху есть выпадающий список функций
3. Выберите функцию `doPost`
4. Нажмите кнопку **"Run"** (▶️) или **"Test"**
5. При первом запуске нужно будет авторизовать доступ

⚠️ **Проблема:** `doPost` требует данные, которые нельзя передать через "Run" кнопку.

---

## Способ 3: Тест через Postman или curl (рекомендуется)

### Вариант А: Используйте Postman

1. Установите [Postman](https://www.postman.com/downloads/) (или используйте онлайн версию)
2. Создайте новый POST запрос:
   - **URL**: ваш Web App URL (заканчивается на `/exec`)
   - **Method**: POST
   - **Headers**: 
     - `Content-Type: application/json`
   - **Body** (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "timestamp": "2024-01-15T12:00:00Z",
       "source": "test",
       "deviceType": "desktop",
       "browser": "Chrome",
       "os": "Windows",
       "language": "en",
       "screenWidth": 1920,
       "screenHeight": 1080
     }
     ```
3. Нажмите **Send**
4. Должен вернуться: `{"success": true}`
5. Проверьте Google Sheet → должна появиться новая строка!

### Вариант Б: Используйте curl (в терминале)

```bash
curl -X POST "ВАШ_URL_С_/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "timestamp": "2024-01-15T12:00:00Z",
    "source": "test",
    "deviceType": "desktop",
    "browser": "Chrome",
    "os": "Windows",
    "language": "en",
    "screenWidth": 1920,
    "screenHeight": 1080
  }'
```

Замените `ВАШ_URL_С_/exec` на ваш реальный URL.

---

## Способ 4: Простая HTML страница для тестирования

Создайте файл `test-webhook.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Google Sheets Webhook</title>
</head>
<body>
  <h1>Test Google Sheets Webhook</h1>
  <button onclick="testWebhook()">Test Webhook</button>
  <div id="result"></div>

  <script>
    async function testWebhook() {
      const webhookUrl = 'ВАШ_URL_С_/exec'; // Замените на ваш URL
      
      const payload = {
        email: 'test@example.com',
        timestamp: new Date().toISOString(),
        source: 'test',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        language: 'en',
        screenWidth: 1920,
        screenHeight: 1080
      };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        document.getElementById('result').innerHTML = 
          '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
        
        if (result.success) {
          alert('✅ Success! Check your Google Sheet!');
        }
      } catch (error) {
        document.getElementById('result').innerHTML = 
          '<pre style="color: red;">Error: ' + error.message + '</pre>';
      }
    }
  </script>
</body>
</html>
```

1. Откройте файл в браузере
2. Нажмите кнопку "Test Webhook"
3. Проверьте Google Sheet → должна появиться строка!

---

## ✅ Что проверить после теста:

1. **Google Apps Script → View → Execution log**
   - Должна быть запись о выполнении
   - Должно быть: `success: true`

2. **Google Sheets**
   - Должна появиться новая строка с тестовым email

3. **Если ошибка:**
   - Проверьте права доступа: **Deploy** → **Manage deployments** → **Who has access**: должно быть **Anyone**
   - Проверьте количество колонок в Google Sheet (должно соответствовать количеству полей в `appendRow`)

---

## 🎯 Рекомендация:

**Используйте Способ 3 (Postman или curl)** - это самый быстрый способ проверить, работает ли скрипт.

Если тест проходит успешно → проблема в Railway (переменная не установлена или не читается).
Если тест не проходит → проблема в Google Apps Script (права доступа, код, или Google Sheet).

