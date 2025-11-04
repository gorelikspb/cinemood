# Railway Configuration

## Важно: Настройки в Railway Dashboard

Railway должен быть настроен так:

1. **Root Directory**: `server` (обязательно!)
2. **Build Command**: оставьте пустым (Railway автоматически найдет `npm install`)
3. **Start Command**: оставьте пустым (Railway автоматически найдет `npm start`)

## Если Railway не видит настройки:

1. Откройте **Settings** → **Service**
2. Найдите **"Root Directory"**
3. Введите: `server`
4. Сохраните

## Альтернатива: Использовать Nixpacks с явными командами

Если Railway все равно пытается собрать frontend:

1. В Railway → **Settings** → **Build & Deploy**
2. **Build Command**: `npm install` (или оставьте пустым)
3. **Start Command**: `npm start` (или оставьте пустым)

Railway должен автоматически определить Node.js проект в папке `server`.

