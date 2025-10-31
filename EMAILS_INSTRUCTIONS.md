# 📧 Получение Email'ов пользователей

## Простой способ получить все email'ы

### Вариант 1: JSON формат (в браузере)

Откройте в браузере:
```
http://localhost:5000/api/emails
```

Вы получите JSON с массивом всех email'ов:
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

### Вариант 2: CSV формат (для скачивания)

Откройте в браузере:
```
http://localhost:5000/api/emails?format=csv
```

Браузер автоматически скачает файл `emails.csv` с данными в формате:
```
id,email,created_at,updated_at
1,user@example.com,"2024-01-15 10:30:00","2024-01-15 10:30:00"
2,another@example.com,"2024-01-15 11:00:00","2024-01-15 11:00:00"
```

### Вариант 3: Через командную строку (PowerShell)

```powershell
# JSON
Invoke-WebRequest -Uri http://localhost:5000/api/emails | Select-Object -ExpandProperty Content

# CSV (сохранить в файл)
Invoke-WebRequest -Uri "http://localhost:5000/api/emails?format=csv" -OutFile emails.csv
```

### Вариант 4: Проверить конкретный email

```
http://localhost:5000/api/emails/check/user@example.com
```

Вернет:
```json
{
  "exists": true,
  "created_at": "2024-01-15 10:30:00"
}
```

## Где хранятся email'ы?

Email'ы сохраняются в базе данных SQLite:
- Файл: `server/database.sqlite`
- Таблица: `emails`
- Поля: `id`, `email`, `created_at`, `updated_at`

## Доступ к базе данных напрямую

Если нужно посмотреть данные напрямую в базе:

1. Установите SQLite Browser: https://sqlitebrowser.org/
2. Откройте файл `server/database.sqlite`
3. Найдите таблицу `emails`

Или через командную строку:
```bash
sqlite3 server/database.sqlite "SELECT * FROM emails;"
```

## API Endpoints

### POST /api/emails
Отправить email:
```json
{
  "email": "user@example.com"
}
```

### GET /api/emails
Получить все email'ы (JSON):
```
GET /api/emails
```

### GET /api/emails?format=csv
Получить все email'ы (CSV):
```
GET /api/emails?format=csv
```

### GET /api/emails/check/:email
Проверить, есть ли email в базе:
```
GET /api/emails/check/user@example.com
```

