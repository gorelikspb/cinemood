# 🚀 УЛЬТРА-ПРОСТАЯ НАСТРОЙКА Google Sheets (3 шага)

## ⚡ Всего 3 простых шага (5 минут):

### Шаг 1: Создайте Google Sheet

1. Откройте https://sheets.google.com
2. Нажмите **"Blank"** (новая таблица)
3. В первой строке (A1, B1, C1) введите:
   ```
   Email | Дата добавления | Время
   ```

### Шаг 2: Создайте Webhook (СКОПИРУЙТЕ И ВСТАВЬТЕ КОД)

1. В Google Sheets нажмите **"Extensions"** → **"Apps Script"**
2. Удалите весь код, который там есть
3. **СКОПИРУЙТЕ И ВСТАВЬТЕ** этот код:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = data.timestamp || new Date().toISOString();
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    sheet.appendRow([
      email,
      new Date(timestamp).toLocaleDateString('ru-RU'),
      new Date(timestamp).toLocaleTimeString('ru-RU')
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Нажмите **"Save"** (дискетка) → назовите проект "Email Webhook"
5. Нажмите **"Deploy"** → **"New deployment"**
6. Нажмите на иконку шестеренки → выберите **"Web app"**
7. Настройки:
   - **Description**: Email Webhook
   - **Execute as**: Me
   - **Who has access**: Anyone
8. Нажмите **"Deploy"**
9. **Авторизуйте** доступ (нажмите "Authorize access" → выберите ваш Google аккаунт → "Advanced" → "Go to Email Webhook" → "Allow")
10. **СКОПИРУЙТЕ Web App URL** (он будет показан после деплоя)

### Шаг 3: Добавьте URL в Railway

1. Откройте Railway Dashboard → ваш проект
2. **Variables** → **"New Variable"**
3. Добавьте:
   - **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value**: вставьте URL из шага 2
4. Нажмите **"Save"**

Railway автоматически перезапустит сервер.

---

## ✅ Готово!

Теперь все новые email адреса будут автоматически добавляться в вашу Google Sheet!

**Проверьте:**
1. Добавьте тестовый email через ваше приложение
2. Откройте Google Sheet
3. Должна появиться новая строка с email!

---

## 💡 Советы:

- **Таблица будет обновляться автоматически** при каждом новом email
- Можно делать рассылки прямо из Google Sheets (Mail Merge, Yet Another Mail Merge)
- Все **бесплатно** и работает **автоматически**

---

## ❓ Если что-то не работает:

1. **Проверьте Railway логи:**
   - Railway Dashboard → Deployments → View Logs
   - Должно быть: `✅ Email sent to Google Sheets: ...`

2. **Проверьте переменную окружения:**
   - Убедитесь, что `GOOGLE_SHEETS_WEBHOOK_URL` добавлен в Railway

3. **Проверьте Google Apps Script:**
   - Откройте Apps Script → View → Execution log
   - Должно быть: `success: true`

**Всё готово! Теперь email автоматически попадают в таблицу!** 🎉

