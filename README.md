# Cinemood - Movie Diary with Emotions

A beautiful web application for tracking movies you've watched with emotional responses and insights.

## Features

- 🎬 Log movies you've watched
- 😊 Track emotional responses to films
- 📊 Visualize your movie watching patterns
- 🔍 Search and discover new movies
- 📈 Personal statistics and insights
- 💾 Persistent data storage

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (for simplicity)
- **Movie Data**: TMDB API integration

## Getting Started

1. Install dependencies:
```bash
npm run install-all
```

2. Start development servers:

**Для Windows PowerShell (рекомендуется - используйте скрипты):**

Откройте ДВА отдельных терминала в корне проекта:

**Терминал 1 - Backend:**
```powershell
.\start-server.ps1
```

**Терминал 2 - Frontend:**
```powershell
.\start-client.ps1
```

**Или запустите вручную:**

**Терминал 1 - Backend:**
```powershell
cd server
npm start
```

**Терминал 2 - Frontend:**
```powershell
cd client
npm start
```

**Остановка всех серверов:**
```powershell
.\restart.ps1
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

📖 **Подробная инструкция по сбросу и перезапуску:** см. [RESET_INSTRUCTIONS.md](./RESET_INSTRUCTIONS.md)

## Project Structure

```
rewatch-app/
├── client/          # React frontend
├── server/          # Express backend
└── package.json     # Root package configuration
```

## Environment Setup

Create a `.env` file in the server directory with:
```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
```

Get your TMDB API key at: https://www.themoviedb.org/settings/api

## Настройка системы рекомендаций

Простая система выбора типа рекомендаций.

**Как настроить:**

Откройте `client/src/config.ts` и выберите тип:
```typescript
recommendationType: 'gems' as 'gems' | 'popular' | 'trend',
```

**Доступные типы:**
- **`gems`** - скрытые жемчужины (настраиваемые фильтры)
- **`popular`** - популярные фильмы прямо сейчас
- **`trend`** - трендовые фильмы за неделю

**Настройки для `gems`:**
```typescript
gems: {
  minRating: 6.9,           // Минимальный рейтинг (0-10)
  minVoteCount: 500,        // Минимальное количество оценок
  maxVoteCount: 5000,       // Максимальное количество оценок
  minReleaseDate: '2010-01-01', // Не раньше этого года
}
```

## 📧 Получение Email'ов пользователей

Все email'ы сохраняются в базе данных. Простые способы получить их:

- **JSON формат:** `http://localhost:5000/api/emails`
- **CSV формат:** `http://localhost:5000/api/emails?format=csv`

📖 **Детальные инструкции:** см. [EMAILS_INSTRUCTIONS.md](./EMAILS_INSTRUCTIONS.md)


