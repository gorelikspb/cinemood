# 📊 Автоматическая отправка email в Google Sheets

## ✅ Вариант 1: Google Sheets (БЕСПЛАТНО И ПРОСТО)

### Шаг 1: Создайте Google Sheet

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. В первой строке добавьте заголовки:
   ```
   Email | Дата добавления | Время
   ```

### Шаг 2: Создайте Google Apps Script (Webhook)

1. В Google Sheets → **Extensions** → **Apps Script**
2. Вставьте этот код:

```javascript
function doPost(e) {
  try {
    // Получаем данные из запроса
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Получаем активную таблицу
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Добавляем новую строку
    sheet.appendRow([
      email,
      new Date(timestamp).toLocaleDateString('ru-RU'),
      new Date(timestamp).toLocaleTimeString('ru-RU')
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: 'Email added to sheet' 
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Save** проект (назовите его "Email Webhook")
4. **Deploy** → **New deployment**
5. Выберите тип: **Web app**
6. Настройки:
   - **Execute as**: Me
   - **Who has access**: Anyone
7. Нажмите **Deploy**
8. **Скопируйте Web App URL** (это ваш webhook URL)

### Шаг 3: Добавьте webhook URL в Railway

В Railway Dashboard → **Variables**:
- **Name**: `GOOGLE_SHEETS_WEBHOOK_URL`
- **Value**: ваш Web App URL из шага 2

### Шаг 4: Обновите код сервера

Код уже обновлен! При добавлении нового email он автоматически отправится в Google Sheets.

---

## 📧 Вариант 2: Просто отправка на email (САМОЕ ПРОСТОЕ)

Если Google Sheets слишком сложно, можно просто отправлять email на вашу почту при добавлении нового email адреса.

**Настройка:**
1. В Railway → **Variables** → добавьте:
   - `NOTIFICATION_EMAIL` = ваш email
   - `SMTP_HOST` = smtp.gmail.com (или другой SMTP)
   - `SMTP_USER` = ваш email
   - `SMTP_PASS` = пароль приложения Gmail

Это тоже бесплатно, но требует настройку SMTP.

---

## 🎯 Рекомендация

**Используйте Google Sheets** - это:
- ✅ Бесплатно
- ✅ Автоматически добавляет email в таблицу
- ✅ Можно сразу делать рассылки через Google Sheets
- ✅ Просто настроить (5 минут)

---

## 📝 После настройки

После добавления webhook URL в Railway, все новые email адреса будут автоматически добавляться в вашу Google Sheet.

Вы сможете:
- Видеть все email в реальном времени
- Делать рассылки через Google Sheets (Mail Merge)
- Экспортировать для других сервисов рассылок

