# 🎣 Переиспользуемые React Хуки

## useMovieSearch

**Файл:** `client/src/hooks/useMovieSearch.ts`

**Назначение:** Поиск фильмов через TMDB API с debouncing и кэшированием.

**Возвращает:**
```tsx
{
  searchQuery: string,           // Текущий поисковый запрос
  setSearchQuery: (q: string) => void,
  searchResults: Movie[],        // Результаты поиска
  searching: boolean,            // Идет ли поиск
  showResults: boolean,          // Показывать ли результаты
  hasResults: boolean,           // Есть ли результаты
  clearSearch: () => void        // Очистить поиск
}
```

**Использование:**
```tsx
const search = useMovieSearch();

// В JSX
<input 
  value={search.searchQuery}
  onChange={(e) => search.setSearchQuery(e.target.value)}
/>
{search.showResults && search.searchResults.map(...)}
```

**Ключевые особенности:**
- Debouncing 300ms
- React Query кэширование
- Автоматическое управление состояниями

## useMovieForm

**Файл:** `client/src/hooks/useMovieForm.ts`

**Назначение:** Управление состоянием формы для оценки фильма.

**Возвращает:**
```tsx
{
  // Состояние
  userRating: number,
  notes: string,
  watchedDate: string,
  emotions: Array<{type: string}>,
  emotionDescription: string,
  
  // Сеттеры
  setUserRating: (rating: number) => void,
  setNotes: (notes: string) => void,
  setWatchedDate: (date: string) => void,
  setEmotions: (emotions: Array<{type: string}>) => void,
  setEmotionDescription: (desc: string) => void,
  
  // Обработчики эмоций
  handleEmotionClick: (emotion: string) => void,
  handleRemoveEmotion: (index: number) => void,
  
  // Утилиты
  resetForm: () => void,
  loadFormData: (data: Partial<MovieFormData>) => void
}
```

**Использование:**
```tsx
// В AddMovie.tsx
const movieForm = useMovieForm();

// В MovieDetails.tsx (с начальными данными)
const movieForm = useMovieForm();
// Загрузка данных после получения фильма
movieForm.loadFormData({
  userRating: movie.user_rating,
  notes: movie.notes,
  // ...
});

// В JSX
<MovieForm
  userRating={movieForm.userRating}
  onRatingChange={movieForm.setUserRating}
  onEmotionClick={movieForm.handleEmotionClick}
  // ...
/>
```

**Ключевые особенности:**
- Инкапсулирует всю логику формы
- Умные обработчики эмоций (добавление/удаление)
- Загрузка и сброс данных
- Переиспользование в разных компонентах

## Принципы разделения хуков

### ✅ Правильно - Single Responsibility

```tsx
// Каждый хук делает одну вещь хорошо
const movieSearch = useMovieSearch();     // Только поиск
const movieForm = useMovieForm();         // Только форма
```

### ❌ Неправильно - слишком много ответственности

```tsx
// Плохо - один хук для всего
const useMovieSearchAndForm = () => {
  // Поиск + форма + debouncing + валидация + автосохранение
  // = сложно тестировать, сложно понимать
}
```

## Композиция хуков

В компонентах можно комбинировать хуки по необходимости:

```tsx
// AddMovie.tsx - нужны и поиск, и форма
const movieSearch = useMovieSearch();
const movieForm = useMovieForm();

// MovieDetails.tsx - только форма
const movieForm = useMovieForm();

// MovieSearch.tsx - только поиск  
const movieSearch = useMovieSearch();
```

## Преимущества архитектуры

### 🎯 Переиспользование
- `useMovieForm` используется в AddMovie и MovieDetails
- `useMovieSearch` используется в AddMovie и потенциально в других местах

### 🧪 Тестируемость
- Каждый хук можно тестировать отдельно
- Простые входы и выходы

### 📖 Читаемость
- Понятно что делает каждый хук
- Легко найти нужную логику

### 🔧 Поддерживаемость
- Изменения в одном месте
- Легко добавить новые поля в форму
- Легко изменить логику поиска

## Следующие шаги

1. ✅ `useMovieSearch` - создан и используется
2. ✅ `useMovieForm` - создан и используется  
3. 📋 `useLocalStorage` - для работы с localStorage
4. 📋 `useDebounce` - общий хук для debouncing
5. 📋 `useMutation` обертки - для типизированных мутаций
