/**
 * 📝 ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ЛОГИРОВАНИЯ
 * 
 * Простые функции для логирования с эмодзи и префиксами.
 * Легко отключить в продакшене или изменить уровень логирования.
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  // 🎬 Фильмы
  movieSelected: (title: string) => {
    if (isDev) console.log('🎬 Movie selected:', title);
  },
  
  movieLoaded: (title: string) => {
    if (isDev) console.log('✅ Movie loaded:', title);
  },
  
  movieSaved: (title: string, id?: number) => {
    if (isDev) console.log('💾 Movie saved:', title, id ? `(ID: ${id})` : '');
  },
  
  // 😊 Эмоции
  emotionAdded: (emotion: string) => {
    if (isDev) console.log('➕ Emotion added:', emotion);
  },
  
  emotionRemoved: (emotion: string) => {
    if (isDev) console.log('➖ Emotion removed:', emotion);
  },
  
  emotionsSaved: (emotions: string[]) => {
    if (isDev) console.log('😊 Emotions saved:', emotions);
  },
  
  // 🔍 Поиск
  searchStarted: (query: string) => {
    if (isDev) console.log('🔍 Search started:', query);
  },
  
  searchResults: (count: number) => {
    if (isDev) console.log('📋 Search results:', count, 'movies found');
  },
  
  // 🚀 Операции
  formSubmitted: (title: string) => {
    if (isDev) console.log('🚀 Form submitted for:', title);
  },
  
  formCompleted: () => {
    if (isDev) console.log('🎉 Form submission completed!');
  },
  
  // ❌ Ошибки
  error: (message: string, error?: any) => {
    if (isDev) console.error('❌', message, error);
  },
  
  // ⚠️ Предупреждения
  warn: (message: string) => {
    if (isDev) console.warn('⚠️', message);
  },
  
  // 📝 Общие
  info: (message: string, data?: any) => {
    if (isDev) console.log('ℹ️', message, data || '');
  },
  
  success: (message: string) => {
    if (isDev) console.log('✅', message);
  },

  // 🎬 Рекомендации
  recommendationsLoaded: (type: string, movies: any[], excludeGenres?: string[]) => {
    if (!isDev) return;
    
    // Маппинг ID жанров на названия
    const genreIdToName: { [key: number]: string } = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
      99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
      27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
      878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    
    console.log(`\n🎬 Recommendations loaded (${type}): ${movies.length} movies`);
    if (excludeGenres && excludeGenres.length > 0) {
      console.log(`🚫 Excluded genres: ${excludeGenres.join(', ')}\n`);
    } else {
      console.log('');
    }
    
    movies.forEach((movie, index) => {
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      const votes = movie.vote_count ? movie.vote_count.toLocaleString() : '0';
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
      
      // Получаем названия жанров
      let genres = 'No genres';
      if (movie.genre_ids && Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
        const genreNames = movie.genre_ids
          .map((id: number) => genreIdToName[id] || `Genre${id}`)
          .join(', ');
        genres = `[${genreNames}]`;
        
        // Проверяем, есть ли исключенные жанры (для отладки - если фильм прошел фильтрацию, но имеет исключенные жанры)
        const hasExcludedGenre = excludeGenres && movie.genre_ids.some((id: number) => {
          const genreName = genreIdToName[id];
          return genreName && excludeGenres.includes(genreName);
        });
        
        if (hasExcludedGenre) {
          // Это ОШИБКА - фильм с исключенными жанрами не должен попасть сюда!
          const excluded = movie.genre_ids
            .map((id: number) => genreIdToName[id])
            .filter((name: string) => excludeGenres && excludeGenres.includes(name));
          console.error(`  ❌ ERROR: ${index + 1}. "${movie.title}" (${year}) - ⭐ ${rating}/10 - 👥 ${votes} votes - 🎭 ${genres} - ⚠️⚠️⚠️ HAS EXCLUDED GENRES BUT STILL IN RESULTS: ${excluded.join(', ')}`);
        } else {
          console.log(`  ${index + 1}. "${movie.title}" (${year}) - ⭐ ${rating}/10 - 👥 ${votes} votes - 🎭 ${genres}`);
        }
      } else {
        console.log(`  ${index + 1}. "${movie.title}" (${year}) - ⭐ ${rating}/10 - 👥 ${votes} votes - 🎭 ${genres}`);
      }
    });
    console.log(''); // Пустая строка для читаемости
  }
};
