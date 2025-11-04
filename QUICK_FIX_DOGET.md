# ⚡ БЫСТРОЕ ИСПРАВЛЕНИЕ: Добавьте функцию doGet

## Проблема: "Script function not found: doGet"

Это значит, что функция `doGet` отсутствует в вашем Google Apps Script.

## Решение:

### 1. Откройте Google Apps Script
- Google Sheets → **Extensions** → **Apps Script**

### 2. Убедитесь, что есть ОБЕ функции:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = data.timestamp || new Date().toISOString();
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Форматируем размер экрана
    const screenSize = data.screenWidth && data.screenHeight 
      ? `${data.screenWidth}x${data.screenHeight}` 
      : '';
    
    // Добавляем строку с данными
    sheet.appendRow([
      email,
      new Date(timestamp).toLocaleDateString('ru-RU'),
      new Date(timestamp).toLocaleTimeString('ru-RU'),
      data.source || 'unknown',
      data.deviceType || 'desktop',
      data.browser || '',
      data.os || '',
      screenSize,
      data.language || 'en'
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

// Функция для тестирования (открытие в браузере)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    message: 'Google Sheets Webhook is working!',
    status: 'ready',
    note: 'This endpoint accepts POST requests only'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Сохраните код
- Нажмите **Save** (дискетка)

### 4. Обновите deployment
- **Deploy** → **Manage deployments**
- Найдите ваш последний deployment
- Нажмите **Edit** (иконка карандаша)
- Или создайте новый: **Deploy** → **New deployment**
- Нажмите **Deploy**

### 5. Проверьте
- Откройте ваш URL с `/exec` в браузере
- Должно показать: `{"message":"Google Sheets Webhook is working!","status":"ready"}`

---

## ⚠️ Важно:

- **`doGet`** - только для тестирования (GET запросы из браузера)
- **`doPost`** - основная функция (POST запросы от Railway)
- Обе функции нужны!

---

## Если все еще не работает:

1. Проверьте, что код сохранен (Save нажат)
2. Проверьте, что deployment обновлен
3. Убедитесь, что используется URL с `/exec` (не `/dev`)
4. Проверьте права доступа: **Who has access**: **Anyone**

