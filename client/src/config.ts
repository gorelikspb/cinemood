/**
 * Основные настройки приложения
 */
export const config = {
  // Show recommendations on Dashboard and Recommendations page
  showRecommendations: true,
  
  // Тип рекомендаций:
  // 'gems' - скрытые жемчужины (хороший рейтинг, но не слишком популярные)
  // 'popular' - популярные фильмы прямо сейчас
  // 'trend' - трендовые фильмы за неделю
  recommendationType: 'gems' as 'gems' | 'popular' | 'trend',
  
  // Настройки для типа 'gems' (скрытые жемчужины)
  gems: {
    minRating: 7.2,           // Минимальный рейтинг (0-10)
    minVoteCount: 500,        // Минимальное количество оценок
    maxVoteCount: 5000,       // Максимальное количество оценок
    minReleaseDate: '2010-01-01', // Не раньше этого года (YYYY-MM-DD)
    requireRussianTitle: true, // Только фильмы с русским названием
    excludeGenres: ['Animation', 'Music', 'Documentary'], // Исключить жанры: Animation(16), Music(10402), Documentary(99)
  },
};
