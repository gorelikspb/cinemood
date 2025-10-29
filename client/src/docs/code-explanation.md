# 📚 Подробное объяснение кода

## 🎯 Главный вопрос: Hook vs Utils

### 🎣 **React Hook** (`useMovieSearch`)
```typescript
// hooks/useMovieSearch.ts
export const useMovieSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');  // ← СОСТОЯНИЕ
  useEffect(() => { ... }, [searchQuery]);             // ← LIFECYCLE
  const { data } = useQuery(...);                      // ← ДРУГИЕ ХУКИ
  return { searchQuery, setSearchQuery, ... };         // ← ВОЗВРАЩАЕТ СОСТОЯНИЕ
};
```

**Зачем нужен хук?**
1. **Управляет состоянием** - что пользователь печатает
2. **Debouncing** - не спамит API на каждую букву  
3. **Кэширование** - React Query помнит результаты
4. **Переиспользование** - один хук для всех компонентов

### 🛠️ **Utils функции** (`movieUtils.ts`)
```typescript
// utils/movieUtils.ts
export const fetchMovieDetails = async (tmdbId) => {
  const response = await api.get(`/movies/details/${tmdbId}`);  // ← ПРОСТО ЗАПРОС
  return response.data;                                         // ← ВОЗВРАЩАЕТ ДАННЫЕ
};
```

**Зачем utils?**
1. **Чистые функции** - получают данные, возвращают результат
2. **Без состояния** - не привязаны к React
3. **Универсальность** - можно вызывать где угодно

## 🔄 Как работает поиск фильмов

### Шаг 1: Пользователь печатает
```
Пользователь: "s" → "sp" → "spi" → "spider"
```

### Шаг 2: Debouncing
```typescript
// В useMovieSearch.ts
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);  // Обновляем через 500ms
  }, 500);
  
  return () => clearTimeout(timer);  // Отменяем предыдущий таймер
}, [searchQuery]);
```

**Результат:**
- Без debouncing: 6 API запросов (s, sp, spi, spid, spide, spider)
- С debouncing: 1 API запрос через 500ms после "spider"

### Шаг 3: API запрос
```typescript
const { data: searchResults } = useQuery(
  ['search-movies', debouncedSearchQuery],  // Ключ кэширования
  () => api.get('/movies/search', { params: { query: debouncedSearchQuery } }),
  { enabled: debouncedSearchQuery.length > 2 }  // Запрос только если > 2 символов
);
```

### Шаг 4: Кэширование
```
Первый поиск "spider" → API запрос → сохранение в кэш
Повторный поиск "spider" → возврат из кэша (без API)
```

## 🎬 Жизненный цикл добавления фильма

### 1. Поиск и выбор
```typescript
// Пользователь выбирает фильм из результатов
const handleMovieSelect = async (movie) => {
  const movieData = await fetchMovieDetails(movie.id);  // Получаем полную информацию
  setSelectedMovie(movieData);                          // Сохраняем в состояние
  setSearchQuery('');                                   // Очищаем поиск
  scrollToElement('selected-movie-section');           // Прокручиваем к карточке
};
```

### 2. Заполнение формы
```typescript
// Состояние формы
const [userRating, setUserRating] = useState(5);      // Оценка 1-10
const [emotions, setEmotions] = useState([]);         // Массив эмоций
const [notes, setNotes] = useState('');               // Заметки
const [watchedDate, setWatchedDate] = useState('..'); // Дата просмотра
```

### 3. Отправка формы
```typescript
const handleSubmit = async () => {
  // Шаг 1: Сохраняем фильм
  const movieResponse = await addMovieMutation.mutateAsync(movieData);
  const movieId = movieResponse.data.id;
  
  // Шаг 2: Сохраняем эмоции
  for (const emotion of emotions) {
    await addEmotionMutation.mutateAsync({
      movie_id: movieId,
      emotion_type: emotion.type,
      // ...
    });
  }
  
  // Шаг 3: Перенаправление
  navigate('/diary');
};
```

## 🗂️ Структура данных

### Фильм в базе данных
```sql
movies:
  id: 1
  tmdb_id: 550
  title: "Fight Club"
  overview: "An insomniac office worker..."
  poster_path: "/abc123.jpg"
  user_rating: 9
  watched_date: "2023-10-28"
  notes: "Amazing movie!"
```

### Эмоции в базе данных
```sql
emotions:
  id: 1
  movie_id: 1
  emotion_type: "excited"
  intensity: 5
  description: "Incredible plot twist!"
```

### Watchlist в localStorage
```javascript
localStorage['rewatch-watchlist'] = '["550", "13", "680"]'
```

## 🔧 Архитектурные решения

### Почему React Query?
```typescript
// Без React Query - много кода
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

useEffect(() => {
  setLoading(true);
  api.get('/movies/search')
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, [query]);

// С React Query - одна строка
const { data, isLoading, error } = useQuery(
  ['search', query], 
  () => api.get('/movies/search')
);
```

### Почему отдельные мутации?
```typescript
// Фильм и эмоции - разные сущности в базе
const addMovieMutation = useMutation(movieData => api.post('/movies', movieData));
const addEmotionMutation = useMutation(emotionData => api.post('/emotions', emotionData));

// Можно добавить фильм без эмоций
// Можно добавить эмоции к существующему фильму
// Легче тестировать и отлаживать
```

### Почему localStorage для watchlist?
```typescript
// Простое решение для MVP
// Не требует регистрации
// Работает офлайн
// Легко мигрировать на сервер позже

const watchlist = JSON.parse(localStorage.getItem('rewatch-watchlist') || '[]');
```

## 🎨 UI/UX решения

### Debounced поиск
- **Проблема**: Пользователь печатает быстро → много API запросов
- **Решение**: Ждем 500ms после остановки печати

### Автопрокрутка
- **Проблема**: Пользователь выбрал фильм, но не видит карточку
- **Решение**: `scrollToElement('selected-movie-section')`

### Кэширование
- **Проблема**: Повторный поиск "spider" → новый API запрос
- **Решение**: React Query кэширует на 5 минут

### Responsive дизайн
- **Desktop**: Поиск слева, форма справа
- **Mobile**: Одна колонка, touch-friendly кнопки

## 🚀 Производительность

### Что оптимизировано:
1. **Debouncing** - меньше API запросов
2. **Кэширование** - React Query
3. **Lazy loading** - изображения загружаются по требованию
4. **Оптимизированные размеры** - w92 для превью, w500 для деталей

### Что можно улучшить:
1. **Виртуализация** - для больших списков результатов
2. **Prefetching** - предзагрузка популярных фильмов
3. **Service Worker** - офлайн кэширование
4. **Image optimization** - WebP формат

## 🔍 Отладка

### Полезные console.log:
```typescript
console.log('🔍 Starting movie search with query:', debouncedSearchQuery);
console.log('🎬 Search results received:', res.data);
console.log('✅ Movie selected and loaded:', movieData.title);
console.log('🚀 Starting form submission for:', selectedMovie.title);
```

### React DevTools:
- Проверить состояние хуков
- Посмотреть React Query кэш
- Отследить ререндеры

### Network tab:
- Проверить API запросы
- Убедиться в debouncing
- Проверить размеры изображений

Теперь код полностью документирован и понятен! 🎉
