import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Star, 
  Calendar,
  Film,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { MovieForm } from '../components/MovieForm';
import { STYLES } from '../constants/styles';
import { useMovieForm } from '../hooks/useMovieForm';
import { track, AnalyticsEvents } from '../utils/analytics';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, t } = useTranslation();
  
  const [showDescription, setShowDescription] = useState(false);
  
  // 📝 СОСТОЯНИЕ ФОРМЫ (вынесено в переиспользуемый хук)
  const movieForm = useMovieForm();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch movie details
  const { data: movie, isLoading } = useQuery(
    ['movie', id, language],
    () => api.get(`/movies/${id}`, {
      params: {
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data),
    {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        // Загружаем данные ТОЛЬКО при первой загрузке (когда prevValuesRef пустой)
        // После сохранения НЕ перезаписываем состояние формы, чтобы не потерять изменения
        const emotionsFromServer = data.emotions || [];
        
        // Убеждаемся, что эмоции в правильном формате [{type: string}, ...]
        const normalizedEmotions = emotionsFromServer.map((e: any) => ({
          type: typeof e === 'string' ? e : (e.type || e.emotion_type || '')
        })).filter((e: any) => e.type); // Убираем пустые
        
        console.log('📥 onSuccess - received data:', {
          rawEmotions: emotionsFromServer,
          normalizedEmotions: normalizedEmotions,
          emotionsCount: normalizedEmotions.length,
          hasPrevValues: !!prevValuesRef.current
        });
        
        if (!prevValuesRef.current) {
          // Первая загрузка - загружаем все данные с сервера
          console.log('📥 First load - loading movie data from server');
          console.log('📥 Normalized emotions:', normalizedEmotions);
          console.log('📥 Emotions count:', normalizedEmotions.length);
          
          // ВАЖНО: загружаем эмоции СРАЗУ, не ждем
          movieForm.loadFormData({
            userRating: data.user_rating || 5,
            notes: data.notes || '',
            watchedDate: data.watched_date || '',
            emotions: normalizedEmotions.length > 0 ? normalizedEmotions : [], // Всегда передаем массив, даже пустой
            emotionDescription: ''
          });
          
          // Проверяем, что эмоции установились (с небольшой задержкой для React)
          setTimeout(() => {
            console.log('📥 After loadFormData - current form emotions:', movieForm.emotions.map((e: any) => e.type || e));
          }, 100);
          
          prevValuesRef.current = {
            userRating: data.user_rating || 5,
            notes: data.notes || '',
            watchedDate: data.watched_date || '',
            emotions: normalizedEmotions.map((e: any) => ({ ...e }))
          };
          
          console.log('✅ Form initialized with emotions:', prevValuesRef.current.emotions.map((e: any) => e.type));
        } else {
          // Данные уже загружены - НЕ перезаписываем состояние формы
          // Это предотвращает сброс изменений пользователя при перезагрузке данных
          console.log('📥 Data reloaded but keeping current form state. Current emotions:', movieForm.emotions.map(e => e.type));
        }
      }
    }
  );

  // Fetch similar movies
  const { data: similarMovies } = useQuery(
    ['similar-movies', id, language],
    () => api.get(`/movies/${id}/similar`, {
      params: {
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data.results?.slice(0, 5) || []),
    {
      enabled: !!movie,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Update movie mutation
  const updateMovieMutation = useMutation(
    (updateData: any) => api.put(`/movies/${id}`, updateData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movie', id]);
        // Страница всегда в режиме редактирования, setIsEditing больше не нужен
      },
    }
  );

  // Delete movie mutation
  const deleteMovieMutation = useMutation(
    () => api.delete(`/movies/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('movies');
        navigate('/diary');
      },
    }
  );

  // Add emotion mutation
  const addEmotionMutation = useMutation(
    (emotionData: any) => api.post('/emotions', emotionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movie', id]);
        queryClient.invalidateQueries('movies');
      },
    }
  );

  // Delete all emotions for movie mutation
  const deleteEmotionsMutation = useMutation(
    (movieId: string) => api.delete(`/emotions/movie/${movieId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['movie', id]);
        queryClient.invalidateQueries('movies');
      },
    }
  );

  // Сохраняем предыдущие значения для сравнения
  const prevValuesRef = React.useRef<any>(null);

  // Мемоизируем handleSave чтобы избежать лишних пересозданий
  const handleSave = React.useCallback(async () => {
    if (!id || !movie) return; // Не сохраняем если нет данных фильма

    try {
      // Проверяем, изменилось ли что-то
      const currentEmotions = movieForm.emotions.map(e => e.type).sort().join(',');
      const prevEmotions = prevValuesRef.current?.emotions?.map((e: any) => e.type).sort().join(',') || '';
      
      console.log('🔍 Checking for changes:', {
        userRating: prevValuesRef.current?.userRating !== movieForm.userRating,
        notes: prevValuesRef.current?.notes !== movieForm.notes,
        watchedDate: prevValuesRef.current?.watchedDate !== movieForm.watchedDate,
        emotions: currentEmotions !== prevEmotions,
        currentEmotions,
        prevEmotions
      });
      
      const hasChanges = 
        prevValuesRef.current?.userRating !== movieForm.userRating ||
        prevValuesRef.current?.notes !== movieForm.notes ||
        prevValuesRef.current?.watchedDate !== movieForm.watchedDate ||
        currentEmotions !== prevEmotions;

      if (!hasChanges && prevValuesRef.current) {
        console.log('⏭️ No changes detected, skipping save');
        return;
      }

      console.log('💾 Saving movie and emotions:', {
        movieId: id,
        emotions: movieForm.emotions,
        emotionCount: movieForm.emotions.length
      });

      // ШАГ 1: Обновляем основные данные фильма
      await updateMovieMutation.mutateAsync({
        user_rating: movieForm.userRating,
        notes: movieForm.notes || null,
        watched_date: movieForm.watchedDate,
      });

      // ШАГ 2: Удаляем старые эмоции фильма
      console.log('🗑️ Deleting old emotions for movie:', id);
      try {
        await deleteEmotionsMutation.mutateAsync(id);
      } catch (err) {
        console.warn('Warning: Failed to delete old emotions:', err);
      }

      // ШАГ 3: Добавляем новые эмоции
      if (movieForm.emotions.length > 0) {
        console.log('😊 Adding new emotions:', movieForm.emotions.map(e => e.type));
        const emotionPromises = movieForm.emotions.map(emotion => 
          addEmotionMutation.mutateAsync({
            movie_id: parseInt(id),
            emotion_type: emotion.type,
            intensity: 5, // По умолчанию
            description: movieForm.emotionDescription || null,
          }).catch(err => {
            console.error('Failed to add emotion:', emotion.type, err);
            throw err;
          })
        );
        
        // Ждем завершения всех операций сохранения эмоций
        await Promise.all(emotionPromises);
        console.log('✅ All emotions saved successfully');
      } else {
        console.log('ℹ️ No emotions to save');
      }

      // ВАЖНО: Сохраняем текущие значения ДО инвалидации кэша
      // Это предотвратит перезагрузку данных и сброс состояния
      prevValuesRef.current = {
        userRating: movieForm.userRating,
        notes: movieForm.notes,
        watchedDate: movieForm.watchedDate,
        emotions: movieForm.emotions.map(e => ({ ...e })) // Глубокое копирование
      };

      console.log('✅ Movie and emotions saved successfully');
      console.log('💾 Updated prevValuesRef:', prevValuesRef.current);

      // НЕ инвалидируем кэш для текущего фильма - это вызовет перезагрузку и сброс формы
      // Инвалидируем только список фильмов (для других страниц)
      queryClient.invalidateQueries('movies');
    } catch (error) {
      console.error('❌ Failed to save movie and emotions:', error);
    }
  }, [id, movie, movieForm.userRating, movieForm.notes, movieForm.emotions, movieForm.emotionDescription, movieForm.watchedDate, updateMovieMutation, deleteEmotionsMutation, addEmotionMutation, queryClient]);

  // 😊 ОБРАБОТЧИК КЛИКА ПО ЭМОЦИИ С НЕМЕДЛЕННЫМ СОХРАНЕНИЕМ
  // При клике на эмодзи сразу сохраняем (без debounce)
  const handleEmotionClickWithSave = React.useCallback(async (emotion: string) => {
    if (!id || !movie || !prevValuesRef.current) return;
    
    // Вычисляем новые эмоции ДО обновления состояния
    const isSelected = movieForm.emotions.some(e => e.type === emotion);
    const newEmotions = isSelected 
      ? movieForm.emotions.filter(e => e.type !== emotion)
      : [...movieForm.emotions, { type: emotion }];
    
    // Обновляем состояние
    movieForm.handleEmotionClick(emotion);
    
    // Сразу сохраняем с новыми эмоциями (не ждем обновления состояния React)
    setTimeout(async () => {
      try {
        // Принудительно обновляем prevValuesRef для сравнения
        const currentEmotions = newEmotions.map(e => e.type).sort().join(',');
        const prevEmotions = prevValuesRef.current?.emotions?.map((e: any) => e.type).sort().join(',') || '';
        
        if (currentEmotions === prevEmotions) {
          console.log('⏭️ Emotion click: no actual change detected');
          return;
        }

        console.log('😊 Emotion clicked - saving immediately:', {
          emotion,
          action: isSelected ? 'removed' : 'added',
          newEmotions: newEmotions.map(e => e.type)
        });

        // ШАГ 1: Обновляем основные данные фильма
        await updateMovieMutation.mutateAsync({
          user_rating: movieForm.userRating,
          notes: movieForm.notes || null,
          watched_date: movieForm.watchedDate,
        });

        // ШАГ 2: Удаляем старые эмоции
        await deleteEmotionsMutation.mutateAsync(id);

        // ШАГ 3: Добавляем новые эмоции
        if (newEmotions.length > 0) {
          await Promise.all(newEmotions.map(emotion => 
            addEmotionMutation.mutateAsync({
              movie_id: parseInt(id),
              emotion_type: emotion.type,
              intensity: 5,
              description: movieForm.emotionDescription || null,
            })
          ));
        }

        // Обновляем prevValuesRef сразу же
        prevValuesRef.current = {
          userRating: movieForm.userRating,
          notes: movieForm.notes,
          watchedDate: movieForm.watchedDate,
          emotions: newEmotions.map(e => ({ ...e }))
        };

        console.log('✅ Emotion saved immediately');
        
        // НЕ инвалидируем кэш сразу - это вызовет перезагрузку данных и сброс состояния
        // Вместо этого инвалидируем только список фильмов (для других страниц)
        queryClient.invalidateQueries('movies');
      } catch (error) {
        console.error('❌ Failed to save emotion:', error);
      }
    }, 50); // Минимальная задержка для обновления UI
  }, [id, movie, movieForm, updateMovieMutation, deleteEmotionsMutation, addEmotionMutation, queryClient]);

  // УБРАЛИ этот useEffect - инициализация теперь происходит только в onSuccess
  // Это гарантирует, что эмоции загружаются правильно из базы данных

  // Auto-save on change (with debounce) - только если данные фильма загружены
  useEffect(() => {
    if (!movie || isLoading) return; // Не сохраняем пока данные не загружены
    if (!prevValuesRef.current) return; // Не сохраняем пока не инициализированы предыдущие значения

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000); // Увеличиваем задержку до 3 секунд чтобы уменьшить количество запросов

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieForm.userRating, movieForm.notes, JSON.stringify(movieForm.emotions.map(e => e.type).sort()), movieForm.emotionDescription, movieForm.watchedDate]);

  const handleDeleteMovie = () => {
    if (window.confirm(t.confirmDelete)) {
      deleteMovieMutation.mutate();
    }
  };


  if (isLoading) {
    return (
      <div className={STYLES.page}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={STYLES.page}>
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.movieNotFound}
          </h3>
          <p className="text-gray-600 mb-4">
            {t.movieNotFoundDescription}
          </p>
          <button onClick={() => navigate('/diary')} className="btn-primary">
            {t.backToDiary}
          </button>
        </div>
      </div>
    );
  }

  // Check if movie is in watchlist
  const watchlist = JSON.parse(localStorage.getItem('rewatch-watchlist') || '[]');
  const isInWatchlist = movie?.tmdb_id && watchlist.includes(movie.tmdb_id.toString());

  return (
    <div className={STYLES.container}>
      {/* Watchlist Badge */}
      {isInWatchlist && (
        <div className={`${STYLES.stickyHeader} ${STYLES.badgeSuccess} border-b`}>
          <div className={STYLES.flexCenter}>
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className={STYLES.textSmall}>
              {t.addedToWatchlist} <Link to="/watchlist" className="underline font-medium">{t.myWatchlist}</Link>
            </span>
          </div>
        </div>
      )}
      {/* Fixed Header */}
      <div className={STYLES.stickyHeader} style={{top: isInWatchlist ? '32px' : '0'}}>
        <div className={STYLES.flexBetween}>
          <button
            onClick={() => navigate(-1)}
            className={STYLES.buttonSecondary}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0 mx-4">
            <h1 className={`${STYLES.heading2} truncate`}>
              {movie.title}
              {movie.original_title_en && movie.original_title_en !== movie.title && (
                <span className={`${STYLES.textMuted} font-normal text-base`}> ({movie.original_title_en})</span>
              )}
            </h1>
            <div className={`${STYLES.flexCenter} space-x-4 ${STYLES.textSmall} mt-1`}>
              <div className={STYLES.flexCenter}>
                <Calendar className="h-4 w-4 mr-1" />
                {movieForm.watchedDate ? new Date(movieForm.watchedDate).toLocaleDateString() : (movie.watched_date ? new Date(movie.watched_date).toLocaleDateString() : '')}
              </div>
              {movieForm.userRating && (
                <div className={STYLES.flexCenter}>
                  <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                  {movieForm.userRating}/10
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDeleteMovie}
            className={STYLES.buttonDanger}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className={STYLES.spacingLarge}>
        {/* 🔄 ИСПОЛЬЗУЕМ ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ ФОРМЫ */}
        <MovieForm
          userRating={movieForm.userRating}
          notes={movieForm.notes}
          watchedDate={movieForm.watchedDate}
          emotions={movieForm.emotions}
          emotionDescription={movieForm.emotionDescription}
          onRatingChange={movieForm.setUserRating}
          onNotesChange={movieForm.setNotes}
          onWatchedDateChange={movieForm.setWatchedDate}
          onEmotionClick={handleEmotionClickWithSave}
          onRemoveEmotion={movieForm.handleRemoveEmotion}
          onEmotionDescriptionChange={movieForm.setEmotionDescription}
          showDateFirst={false}
        />

        {/* Explicit Save Button */}
        <div className="mt-4">
          <button
            onClick={() => handleSave()}
            className={STYLES.buttonPrimary}
          >
            {t.save}
          </button>
        </div>

        {/* Recommended Movies */}
        {similarMovies && similarMovies.length > 0 && (
          <div className={STYLES.card}>
            <h3 className={STYLES.heading4} style={{ marginBottom: '12px' }}>
              {t.ifYouEnjoyedThisMovie}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {similarMovies.map((similar: any) => (
                <div
                  key={similar.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    // Трекинг: открыт похожий фильм
                    track(AnalyticsEvents.OpenSimilar, {
                      movieId: id,
                      similarMovieId: similar.id,
                      similarMovieTitle: similar.title,
                    });
                    navigate(`/movie-tmdb/${similar.id}`);
                  }}
                >
                  {similar.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w154${similar.poster_path}`}
                      alt={similar.title}
                      className={`${STYLES.moviePoster} mb-2 hover:opacity-75 transition-opacity group-hover:shadow-lg`}
                    />
                  ) : (
                    <div className="w-full h-[231px] bg-gray-200 rounded-lg flex items-center justify-center mb-2 group-hover:bg-gray-300 transition-colors">
                      <Film className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className={`${STYLES.textBody} font-medium text-sm line-clamp-2 group-hover:text-primary-600 transition-colors`}>
                    {similar.title}
                  </h4>
                  {similar.release_date && (
                    <p className={STYLES.textSmall}>
                      {new Date(similar.release_date).getFullYear()}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-primary-600 font-medium">
                    {t.addToWatchlistArrow}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Movie Info */}
        <div className={STYLES.card}>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className={`w-full ${STYLES.flexBetween} text-left`}
          >
            <h3 className={STYLES.heading4}>
              {t.movieInformation}
            </h3>
            <span className={STYLES.textMuted}>{showDescription ? '−' : '+'}</span>
          </button>
          {showDescription && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              <div>
                <span className="font-medium text-gray-700">{t.releaseDateLabel}</span>
                <span className="ml-2 text-gray-600">
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : t.unknown}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.runtimeLabel}</span>
                <span className="ml-2 text-gray-600">
                  {movie.runtime ? `${movie.runtime} ${t.minutes}` : t.unknown}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.genresLabel}</span>
                <span className="ml-2 text-gray-600">
                  {movie.genres?.map((genre: any) => genre.name).join(', ') || t.unknown}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{t.tmdbRatingLabel}</span>
                <span className="ml-2 text-gray-600">
                  {movie.rating ? `${movie.rating.toFixed(1)}/10` : t.nA}
                </span>
              </div>
              {movie.overview && (
                <div>
                  <span className="font-medium text-gray-700">{t.overviewLabel}</span>
                  <p className="mt-1 text-gray-700 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>


        </div>
      </div>
    </div>
  );
};

