# Rewatch App - User Flow Diagram

## 📱 Основные переходы между страницами

```
┌─────────────────┐
│   Dashboard     │ ← Главная страница (/)
│   /             │
└─────────┬───────┘
          │
          ├─── Add Movie (/add-movie)
          │    │
          │    ├─── Search TMDB → Select Movie → Fill Details → Save
          │    └─── ?tmdbId=123 (auto-load from recommendations)
          │
          ├─── Movie Diary (/diary)
          │    │
          │    └─── Click Movie → Movie Details (/movie/:id)
          │                      │
          │                      └─── Similar Movies → TMDB Movie View
          │
          ├─── Watchlist (/watchlist)
          │    │
          │    └─── Click Movie → TMDB Movie View (/movie-tmdb/:tmdbId)
          │
          └─── Recommendations (/recommendations)
               │
               └─── Click Movie → TMDB Movie View (/movie-tmdb/:tmdbId)
```

## 🔄 Детальные пользовательские сценарии

### 1. Новый пользователь (0 фильмов)
```
Dashboard → Popular Movies (8 cards) → Click → TMDB Movie View → Register → Add Movie
```

### 2. Пользователь с 1-2 фильмами
```
Dashboard → Statistics (locked) → Add Movie Button → Add Movie Page
```

### 3. Пользователь с 3+ фильмами
```
Dashboard → Email Banner → Register → Continue using app
```

### 4. Пользователь с 5+ фильмами
```
Dashboard → Full Statistics + Charts → Movie Diary → Movie Details
```

### 5. Поиск рекомендаций
```
Movie Details → Similar Movies → TMDB Movie View → Add to Watchlist → Add Movie
```

## 🎯 Ключевые точки конверсии

### A. Регистрация пользователя
- **Триггер**: 3+ фильма ИЛИ клик на рекомендацию
- **Форма**: Только email
- **Результат**: Сохранение в localStorage

### B. Добавление в Watchlist
- **Источники**: Recommendations, Similar Movies, TMDB Movie View
- **Условие**: Требует регистрации
- **Результат**: Сохранение в localStorage → переход к Add Movie

### C. Добавление фильма в дневник
- **Источники**: Search, Watchlist, Recommendations
- **Данные**: Rating, Emotions, Notes, Date
- **Результат**: Сохранение в SQLite

## 📊 Состояния приложения

### Количество фильмов
- **0 фильмов**: Показать популярные рекомендации
- **1-4 фильма**: Базовая статистика + unlock message
- **3+ фильма**: Email banner
- **5+ фильмов**: Полная статистика

### Регистрация
- **Не зарегистрирован**: Показать форму регистрации
- **Зарегистрирован**: Показать "Add to Watchlist" кнопку
- **Только что зарегистрировался**: Показать "Thanks!" → redirect

## 🔗 Внешние переходы

### TMDB Integration
```
Internal Movie → Similar Movies API → TMDB Movie View → Add Movie
Recommendations Page → TMDB API → TMDB Movie View → Add Movie
```

### Data Flow
```
TMDB API → Movie Details → User Input → SQLite → Dashboard Statistics
```

## 🎨 UI States

### Loading States
- Search results loading
- Movie details loading  
- Recommendations loading
- Statistics loading

### Error States
- Failed to load movies
- TMDB API errors
- Database errors

### Empty States
- No movies in diary
- No search results
- No recommendations
- Empty watchlist

## 🔄 Navigation Patterns

### Primary Navigation (Sidebar)
1. **Add Movie** - Основное действие
2. **Dashboard** - Обзор и статистика  
3. **Movie Diary** - Список просмотренных
4. **Watchlist** - Список "хочу посмотреть"
5. **Recommendations** - Популярные фильмы

### Secondary Navigation
- Language switcher (EN/RU)
- Back buttons
- Breadcrumbs (в Movie Details)

### Mobile Navigation
- Hamburger menu
- Touch-friendly buttons
- Swipe gestures (потенциально)
