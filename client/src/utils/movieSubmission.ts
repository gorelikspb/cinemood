import { logger } from './logger';

/**
 * 🚀 УТИЛИТЫ ДЛЯ СОХРАНЕНИЯ ФИЛЬМОВ И ЭМОЦИЙ
 * 
 * Централизованная логика для:
 * - Подготовки данных фильма
 * - Сохранения фильма в базу
 * - Сохранения эмоций к фильму
 * 
 * Используется в AddMovie.tsx и MovieDetails.tsx
 */

export interface MovieFormData {
  watchedDate: string;
  userRating: number | null;
  notes: string;
  emotions: Array<{ type: string }>;
  emotionDescription: string;
}

export interface SelectedMovie {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  genres?: any[];
  vote_average?: number;
  runtime?: number;
}

/**
 * 📝 ПОДГОТОВКА ДАННЫХ ФИЛЬМА
 * Собирает данные от TMDB и пользователя в единый объект
 */
export const prepareMovieData = (
  selectedMovie: SelectedMovie, 
  movieForm: MovieFormData
) => {
  logger.info('Preparing movie data for submission');
  
  return {
    // Данные от TMDB
    tmdb_id: selectedMovie.id,
    title: selectedMovie.title,
    overview: selectedMovie.overview,
    release_date: selectedMovie.release_date,
    poster_path: selectedMovie.poster_path,
    backdrop_path: selectedMovie.backdrop_path,
    genres: selectedMovie.genres,
    rating: selectedMovie.vote_average,
    runtime: selectedMovie.runtime,
    
    // Пользовательские данные
    watched_date: movieForm.watchedDate,
    user_rating: movieForm.userRating,
    notes: movieForm.notes || null,
  };
};

/**
 * 😊 СОХРАНЕНИЕ ЭМОЦИЙ К ФИЛЬМУ
 * Создает отдельную запись для каждой выбранной эмоции
 */
export const saveMovieEmotions = async (
  movieId: number,
  movieForm: MovieFormData,
  addEmotionMutation: any
) => {
  if (movieForm.emotions.length === 0) {
    logger.info('No emotions to save');
    return;
  }

  const emotionTypes = movieForm.emotions.map(e => e.type);
  logger.info('Saving emotions:', emotionTypes.join(', '));
  
  for (const emotion of movieForm.emotions) {
    await addEmotionMutation.mutateAsync({
      movie_id: movieId,
      emotion_type: emotion.type,
      intensity: 5, // По умолчанию
      description: movieForm.emotionDescription || null,
    });
  }
  
  logger.emotionsSaved(emotionTypes);
};

/**
 * 🎬 ПОЛНОЕ СОХРАНЕНИЕ ФИЛЬМА С ЭМОЦИЯМИ
 * Главная функция для сохранения нового фильма
 */
export const submitMovieWithEmotions = async (
  selectedMovie: SelectedMovie,
  movieForm: MovieFormData,
  addMovieMutation: any,
  addEmotionMutation: any
) => {
  logger.formSubmitted(selectedMovie.title);

  try {
    // ШАГ 1: Подготавливаем данные
    const movieData = prepareMovieData(selectedMovie, movieForm);

    // ШАГ 2: Сохраняем фильм
    const movieResponse = await addMovieMutation.mutateAsync(movieData);
    const movieId = movieResponse.data.id;
    logger.movieSaved(selectedMovie.title, movieId);

    // ШАГ 3: Сохраняем эмоции
    await saveMovieEmotions(movieId, movieForm, addEmotionMutation);

    logger.formCompleted();
    return movieResponse;
    
  } catch (error) {
    logger.error('Form submission failed', error);
    throw error; // Пробрасываем ошибку для обработки в компоненте
  }
};

/**
 * ✏️ ОБНОВЛЕНИЕ СУЩЕСТВУЮЩЕГО ФИЛЬМА
 * Для редактирования уже добавленных фильмов
 */
export const updateMovieWithEmotions = async (
  movieId: number,
  movieTitle: string,
  movieForm: MovieFormData,
  updateMovieMutation: any,
  addEmotionMutation: any,
  // Опционально: мутация для удаления старых эмоций
  deleteEmotionsMutation?: any
) => {
  logger.info('Updating movie:', movieTitle);

  try {
    // ШАГ 1: Обновляем основные данные фильма
    const updateData = {
      user_rating: movieForm.userRating,
      notes: movieForm.notes || null,
      watched_date: movieForm.watchedDate,
    };

    await updateMovieMutation.mutateAsync({
      id: movieId,
      ...updateData
    });

    logger.success('Movie updated successfully');

    // ШАГ 2: Обновляем эмоции (если нужно)
    // Примечание: Здесь может потребоваться более сложная логика
    // для обновления существующих эмоций
    if (movieForm.emotions.length > 0) {
      // Опционально: удаляем старые эмоции
      if (deleteEmotionsMutation) {
        await deleteEmotionsMutation.mutateAsync(movieId);
      }
      
      // Добавляем новые эмоции
      await saveMovieEmotions(movieId, movieForm, addEmotionMutation);
    }

    logger.success('Movie and emotions updated');
    
  } catch (error) {
    logger.error('Movie update failed', error);
    throw error;
  }
};

