# 📧 Как получить email адреса пользователей

## 📍 Где хранятся email адреса

Email адреса сохраняются в базе данных SQLite в таблице `emails`.

**Источники email:**
1. **Таблица `emails`** - когда пользователь оставляет email:
   - На Dashboard (баннер "Хочешь сохранить эмоции?")
   - При добавлении в Watchlist
   
2. **Таблица `feedback`** - когда пользователь оставляет feedback с email (опционально)

---

## 🚀 Вариант 1: Через API (САМЫЙ ПРОСТОЙ)

### Получить все email в JSON формате:

```bash
# Локально
curl http://localhost:5000/api/emails

# На Railway (замените на ваш URL)
curl https://ваш-railway-url.up.railway.app/api/emails
```

**Или откройте в браузере:**
```
http://localhost:5000/api/emails
```

**Результат:**
```json
{
  "count": 5,
  "emails": [
    {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2024-01-15 10:30:00",
      "updated_at": "2024-01-15 10:30:00"
    },
    ...
  ]
}
```

### Получить все email в CSV формате (для Excel):

```bash
# Локально
curl http://localhost:5000/api/emails?format=csv -o emails.csv

# На Railway
curl https://ваш-railway-url.up.railway.app/api/emails?format=csv -o emails.csv
```

**Или откройте в браузере:**
```
http://localhost:5000/api/emails?format=csv
```

Браузер автоматически скачает файл `emails.csv`.

---

## 💾 Вариант 2: Прямой доступ к базе данных

### Локально:

```bash
# Откройте базу данных
cd server
sqlite3 database.sqlite

# Просмотрите все email
SELECT id, email, created_at, updated_at FROM emails ORDER BY created_at DESC;

# Экспортируйте в CSV
.headers on
.mode csv
.output emails.csv
SELECT id, email, created_at, updated_at FROM emails ORDER BY created_at DESC;
.quit
```

### На Railway:

1. В Railway Dashboard → ваш сервис
2. **Metrics** → **View Logs**
3. Или используйте **Railway CLI** для доступа к файлам

**Или используйте API (проще):**

```bash
curl https://ваш-railway-url.up.railway.app/api/emails?format=csv > emails.csv
```

---

## 📋 Вариант 3: Через простой скрипт

Создайте файл `server/export-emails.js`:

```javascript
const db = require('./database');
const fs = require('fs');

db.all('SELECT id, email, created_at, updated_at FROM emails ORDER BY created_at DESC', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  // JSON формат
  fs.writeFileSync('emails.json', JSON.stringify(rows, null, 2));
  
  // CSV формат
  const csv = [
    'id,email,created_at,updated_at',
    ...rows.map(row => `${row.id},${row.email},"${row.created_at}","${row.updated_at}"`)
  ].join('\n');
  
  fs.writeFileSync('emails.csv', csv);
  
  console.log(`✅ Exported ${rows.length} emails to emails.json and emails.csv`);
  
  db.close();
});
```

**Запуск:**
```bash
cd server
node export-emails.js
```

---

## 📊 Получить feedback с email

```bash
# Получить все feedback (включая email, если указан)
curl http://localhost:5000/api/feedback

# Или в CSV
curl http://localhost:5000/api/feedback?format=csv -o feedback.csv
```

---

## 🌐 На продьюшене (Railway)

### Быстрый способ:

1. Откройте ваш Railway URL в браузере:
   ```
   https://ваш-railway-url.up.railway.app/api/emails
   ```

2. Скопируйте JSON или используйте `?format=csv` для скачивания CSV

3. Или используйте curl:
   ```bash
   curl https://ваш-railway-url.up.railway.app/api/emails?format=csv > emails.csv
   ```

---

## 🔒 Безопасность

⚠️ **Важно:** API endpoint `/api/emails` открыт для всех! 

Для продакшена рекомендуется:
1. Добавить авторизацию (токен или базовая авторизация)
2. Или использовать переменную окружения для ограничения доступа

**Пример защиты через переменную окружения:**

В `server/routes/emails.js` добавьте проверку:

```javascript
router.get('/', (req, res) => {
  // Проверка токена из переменной окружения
  const authToken = req.headers.authorization;
  if (authToken !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... остальной код
});
```

Затем в Railway добавьте переменную `ADMIN_TOKEN` и используйте:
```bash
curl -H "Authorization: Bearer ваш-токен" https://ваш-url/api/emails
```

---

## 📝 Итого

**Самый простой способ получить email:**
1. Откройте `https://ваш-railway-url.up.railway.app/api/emails` в браузере
2. Или добавьте `?format=csv` для скачивания CSV файла
3. Готово! ✨

