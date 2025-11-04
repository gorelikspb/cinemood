import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Film,      // Placeholder icon for movies without posters
  ArrowLeft, // Back navigation button
  CheckCircle, // Watchlist status indicator
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { STYLES, STYLE_OBJECTS } from '../constants/styles';
import { 
  fetchMovieDetails, 
  isMovieInWatchlist, 
  getMovieYear, 
  getTMDBPosterUrl,
  scrollToElement 
} from '../utils/movieUtils';
import { MovieSearch } from '../components/MovieSearch';
import { MovieForm } from '../components/MovieForm';
import { useMovieForm } from '../hooks/useMovieForm';
import { logger } from '../utils/logger';
import { submitMovieWithEmotions } from '../utils/movieSubmission';
import { useAddToWatchlist } from '../hooks/useAddToWatchlist';
import { EmailModal } from '../components/EmailModal';
import { track, AnalyticsEvents } from '../utils/analytics';

/**
 * 🎬 СТРАНИЦА ДОБАВЛЕНИЯ ФИЛЬМА
 * 
 * 🔄 Как работает весь процесс:
 * 1. Пользователь ищет фильм → useMovieSearch хук
 * 2. Выбирает из результатов → fetchMovieDetails получает полную информацию
 * 3. Заполняет форму (рейтинг, эмоции, заметки, дата)
 * 4. Нажимает "Добавить" → мутация сохраняет в базу
 * 5. Перенаправление на страницу дневника
 * 
 * 🎯 Альтернативные пути входа:
 * - Прямой переход /add-movie
 * - Из рекомендаций /add-movie?tmdbId=123 (автозагрузка фильма)
 * - Из watchlist /add-movie?tmdbId=456
 */
export const AddMovie: React.FC = () => {
  // 🧭 НАВИГАЦИЯ И ПЕРЕВОДЫ
  const navigate = useNavigate();                    // Для перехода между страницами
  const queryClient = useQueryClient();             // Для инвалидации кэша после добавления
  const { t } = useTranslation();                   // Переводы интерфейса (EN/RU)
  
  // 🔗 АВТОЗАГРУЗКА ФИЛЬМА ИЗ URL
  // Если пользователь пришел с /add-movie?tmdbId=123, автоматически загружаем этот фильм
  const { search } = window.location;               // Получаем ?tmdbId=123 из URL
  const tmdbIdParam = new URLSearchParams(search).get('tmdbId'); // Извлекаем значение tmdbId
  const fromParam = new URLSearchParams(search).get('from'); // Откуда пришел пользователь
  
  // 🔍 ПОИСК ФИЛЬМОВ теперь инкапсулирован в компоненте MovieSearch
  // Логика debouncing, API запросы, кэширование - всё внутри компонента
  
  // 📝 СОСТОЯНИЕ ФОРМЫ (вынесено в переиспользуемый хук)
  const movieForm = useMovieForm();
  const [selectedMovie, setSelectedMovie] = useState<any>(null);           // Выбранный фильм из поиска
  
  // Определяем режим по умолчанию: если пришли из watchlist, то watchlist, иначе diary
  const [mode, setMode] = useState<'diary' | 'watchlist'>(fromParam === 'watchlist' ? 'watchlist' : 'diary');

  // Добавление в watchlist с проверкой email
  // После добавления переходим на страницу watchlist
  const {
    showEmailModal,
    pendingMovieTitle,
    handleAddToWatchlist,
    handleEmailSuccess,
    handleCloseModal,
  } = useAddToWatchlist(() => {
    // Переход на страницу watchlist после добавления
    navigate('/watchlist');
  });

  // 🚀 АВТОЗАГРУЗКА ФИЛЬМА при переходе с tmdbId в URL
  // Срабатывает когда пользователь приходит из рекомендаций или watchlist
  useEffect(() => {
    if (tmdbIdParam) {
      logger.info('Auto-loading movie from URL param:', tmdbIdParam);
      
      const loadMovieFromTmdbId = async () => {
        try {
          // Получаем полную информацию о фильме через утилиту (логирование внутри)
          const movieData = await fetchMovieDetails(tmdbIdParam);
          setSelectedMovie(movieData);
        } catch (error) {
          logger.error('Failed to auto-load movie from URL');
        }
      };
      
      loadMovieFromTmdbId();
    }
  }, [tmdbIdParam]); // Перезапускается если tmdbId в URL изменился

  // 💾 МУТАЦИЯ ДОБАВЛЕНИЯ ФИЛЬМА В БАЗУ
  // React Query мутация для сохранения фильма на сервере
  const addMovieMutation = useMutation(
    // Функция мутации: отправляет POST запрос с данными фильма
    (movieData: any) => api.post('/movies', movieData),
    {
      // Что делать при успешном сохранении
      onSuccess: () => {
        logger.success('Movie added successfully');
        
        // Инвалидируем кэш, чтобы обновились списки фильмов
        queryClient.invalidateQueries('movies');        // Обновить список в дневнике
        queryClient.invalidateQueries('overview-stats'); // Обновить статистику на главной
        
        // Перенаправляем пользователя в дневник фильмов
        navigate('/diary');
      },
    }
  );

  // 💭 МУТАЦИЯ ДОБАВЛЕНИЯ ЭМОЦИЙ
  // Отдельная мутация для сохранения эмоций к фильму
  const addEmotionMutation = useMutation(
    // Функция мутации: отправляет POST запрос с данными эмоции
    (emotionData: any) => api.post('/emotions', emotionData),
    {
      // При успехе обновляем кэш фильмов (чтобы эмоции отобразились)
      onSuccess: () => {
        console.log('✅ Emotion added successfully');
        queryClient.invalidateQueries('movies');
      },
    }
  );

  // 🎯 ОБРАБОТЧИК ВЫБОРА ФИЛЬМА ИЗ РЕЗУЛЬТАТОВ ПОИСКА
  const handleMovieSelect = async (movie: any) => {
    logger.movieSelected(movie.title);
    
    try {
      // Получаем полную информацию о фильме (логирование внутри fetchMovieDetails)
      const movieData = await fetchMovieDetails(movie.id);
      setSelectedMovie(movieData);
      
      // Плавно прокручиваем к карточке выбранного фильма
      scrollToElement('selected-movie-section');
    } catch (error) {
      logger.error('Error selecting movie');
    }
  };
  
  // 😊 ОБРАБОТЧИКИ ЭМОЦИЙ теперь в хуке useMovieForm
  // Логика добавления/удаления эмоций инкапсулирована в хуке

  // 🚀 ГЛАВНАЯ ФУНКЦИЯ ОТПРАВКИ ФОРМЫ
  // Использует централизованную утилиту для сохранения
  const handleSubmit = async () => {
    // Проверяем обязательные поля
    if (!selectedMovie || !movieForm.watchedDate) {
      logger.warn('Cannot submit: missing required fields');
      return;
    }

    try {
      // Используем централизованную функцию сохранения
      await submitMovieWithEmotions(
        selectedMovie,
        movieForm,
        addMovieMutation,
        addEmotionMutation
      );
      
      // Трекинг: фильм добавлен
      track(AnalyticsEvents.AddFilm, {
        movieId: selectedMovie.id,
        rating: movieForm.userRating,
        emotionsCount: movieForm.emotions.length,
      });
    } catch (error) {
      // Ошибка уже залогирована в утилите
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* 📱 ШАПКА СТРАНИЦЫ */}
      <div className={STYLE_OBJECTS.pageHeader.container}>
        <button
          onClick={() => navigate(-1)}
          className={STYLE_OBJECTS.pageHeader.backButton}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <div>
          <h1 className={STYLE_OBJECTS.pageHeader.title}>
            {t.addMovie}
          </h1>
          <p className={STYLE_OBJECTS.pageHeader.subtitle}>
            {t.logMovie}
          </p>
        </div>
      </div>

      {/* 📐 БЛОКИ ПОСЛЕДОВАТЕЛЬНО ДРУГ ЗА ДРУГОМ */}
      <div className="space-y-4">
        {/* Переключатель режимов: Diary / Watchlist */}
        <div className="mb-1">
          <div className="inline-flex w-full sm:w-auto rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              className={`${mode === 'diary' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'} px-4 py-2 flex-1 sm:flex-initial`}
              onClick={() => setMode('diary')}
            >
              {t.addMovieToDiary}
            </button>
            <button
              type="button"
              className={`${mode === 'watchlist' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'} px-4 py-2 border-l border-gray-200 flex-1 sm:flex-initial`}
              onClick={() => setMode('watchlist')}
            >
              {t.addToWatchlist}
            </button>
          </div>
        </div>
        {/* 🔎 БЛОК ПОИСКА ФИЛЬМОВ */}
        <div className={STYLE_OBJECTS.searchSection.container}>
          <h3 className={STYLE_OBJECTS.searchSection.header}>
            {t.searchForMovie}
          </h3>
          
          {/* 🔄 ИСПОЛЬЗУЕМ ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ ПОИСКА */}
          <MovieSearch 
            onMovieSelect={handleMovieSelect}
            placeholder={t.enterMovieTitle}
            maxResults={8}
            className="movie-search-add-page"
          />
        </div>

        {/* Selected Movie */}
        {selectedMovie && (
          <div id="selected-movie-section" className={STYLE_OBJECTS.movieCard.container}>
            <div className={STYLE_OBJECTS.movieCard.header}>
              <h3 className={STYLE_OBJECTS.movieCard.title}>
                {t.selectedMovie}
              </h3>
              {/* Watchlist Badge */}
              {selectedMovie.id && isMovieInWatchlist(selectedMovie.id) && (
                <div className={STYLE_OBJECTS.watchlistBadge.container}>
                  <CheckCircle className={STYLE_OBJECTS.watchlistBadge.icon} />
                  <Link to="/watchlist" className={STYLE_OBJECTS.watchlistBadge.link}>{t.addedToWatchlist}</Link>
                </div>
              )}
            </div>
            <div className={STYLE_OBJECTS.movieCard.content}>
              {selectedMovie.poster_path ? (
                <img
                  src={getTMDBPosterUrl(selectedMovie.poster_path, 'w185')}
                  alt={selectedMovie.title}
                  className={STYLE_OBJECTS.movieCard.poster}
                />
              ) : (
                <div className={STYLE_OBJECTS.movieCard.posterIcon}>
                  <Film className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className={STYLE_OBJECTS.movieCard.info}>
                <h4 className={STYLE_OBJECTS.movieCard.movieTitle}>
                  {selectedMovie.title}
                  {selectedMovie.original_title_en && selectedMovie.original_title_en !== selectedMovie.title && (
                    <span className={STYLES.textMuted}> ({selectedMovie.original_title_en})</span>
                  )}
                </h4>
                <p className={STYLE_OBJECTS.movieCard.year}>
                  {getMovieYear(selectedMovie.release_date)}
                </p>
                <p className={STYLE_OBJECTS.movieCard.overview}>
                  {selectedMovie.overview}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 📝 ФОРМА ДОБАВЛЕНИЯ ФИЛЬМА */}
        <div>
          {/* 🔄 ИСПОЛЬЗУЕМ ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ ФОРМЫ */}
          {mode === 'diary' && (
            <MovieForm
              userRating={movieForm.userRating}
              notes={movieForm.notes}
              watchedDate={movieForm.watchedDate}
              emotions={movieForm.emotions}
              emotionDescription={movieForm.emotionDescription}
              onRatingChange={movieForm.setUserRating}
              onNotesChange={movieForm.setNotes}
              onWatchedDateChange={movieForm.setWatchedDate}
              onEmotionClick={movieForm.handleEmotionClick}
              onRemoveEmotion={movieForm.handleRemoveEmotion}
              onEmotionDescriptionChange={movieForm.setEmotionDescription}
              showDateFirst={true}
            />
          )}

          {/* Submit Button */}
          {mode === 'diary' && (
            <button
              onClick={handleSubmit}
              disabled={!selectedMovie || !movieForm.watchedDate || addMovieMutation.isLoading}
              className={`${!selectedMovie || !movieForm.watchedDate || addMovieMutation.isLoading ? STYLES.buttonDisabled : STYLES.buttonPrimary} w-full py-3 mt-4`}
            >
              {addMovieMutation.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t.addingMovie}
                </div>
              ) : (
                t.addMovieToDiary
              )}
            </button>
          )}
          {/* Add to Watchlist Button */}
          {mode === 'watchlist' && (
            <button
              onClick={() => selectedMovie && handleAddToWatchlist(selectedMovie.id, selectedMovie.title)}
              disabled={!selectedMovie}
              className={`${!selectedMovie ? STYLES.buttonDisabled : STYLES.buttonWatchlist} w-full py-3 mt-3`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t.addToWatchlist}
            </button>
          )}

          {/* Email Modal */}
          <EmailModal
            isOpen={showEmailModal}
            onClose={handleCloseModal}
            onSuccess={handleEmailSuccess}
            movieTitle={pendingMovieTitle}
          />
        </div>
      </div>
    </div>
  );
};

