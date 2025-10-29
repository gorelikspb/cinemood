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

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language } = useTranslation();
  
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
        // Загружаем данные фильма в хук формы
        movieForm.loadFormData({
          userRating: data.user_rating || 5,
          notes: data.notes || '',
          watchedDate: data.watched_date || '',
          emotions: data.emotions || [],
          emotionDescription: '' // TODO: добавить поле в базу если нужно
        });
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

  // 😊 ОБРАБОТЧИКИ ЭМОЦИЙ теперь в хуке useMovieForm

  // Сохраняем предыдущие значения для сравнения
  const prevValuesRef = React.useRef<any>(null);

  // Мемоизируем handleSave чтобы избежать лишних пересозданий
  const handleSave = React.useCallback(async () => {
    if (!id || !movie) return; // Не сохраняем если нет данных фильма

    try {
      // Проверяем, изменилось ли что-то
      const currentEmotions = movieForm.emotions.map(e => e.type).sort().join(',');
      const prevEmotions = prevValuesRef.current?.emotions?.map((e: any) => e.type).sort().join(',') || '';
      
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
        for (const emotion of movieForm.emotions) {
          try {
            await addEmotionMutation.mutateAsync({
              movie_id: parseInt(id),
              emotion_type: emotion.type,
              intensity: 5, // По умолчанию
              description: movieForm.emotionDescription || null,
            });
          } catch (err) {
            console.error('Failed to add emotion:', emotion.type, err);
          }
        }
      }

      // Сохраняем текущие значения для следующего сравнения
      prevValuesRef.current = {
        userRating: movieForm.userRating,
        notes: movieForm.notes,
        watchedDate: movieForm.watchedDate,
        emotions: [...movieForm.emotions]
      };

      console.log('✅ Movie and emotions saved successfully');

      // Инвалидируем кэш для обновления списка
      queryClient.invalidateQueries(['movie', id]);
      queryClient.invalidateQueries('movies');
    } catch (error) {
      console.error('❌ Failed to save movie and emotions:', error);
    }
  }, [id, movie, movieForm.userRating, movieForm.notes, movieForm.emotions, movieForm.emotionDescription, movieForm.watchedDate, updateMovieMutation, deleteEmotionsMutation, addEmotionMutation, queryClient]);

  // Инициализируем prevValuesRef когда загружаются данные фильма
  useEffect(() => {
    if (movie && !prevValuesRef.current) {
      prevValuesRef.current = {
        userRating: movie.user_rating,
        notes: movie.notes,
        watchedDate: movie.watched_date,
        emotions: movie.emotions || []
      };
    }
  }, [movie]);

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
    if (window.confirm('Are you sure you want to delete this movie from your diary?')) {
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
            Movie not found
          </h3>
          <p className="text-gray-600 mb-4">
            The movie you're looking for doesn't exist in your diary.
          </p>
          <button onClick={() => navigate('/diary')} className="btn-primary">
            Back to Diary
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
              Added to <Link to="/watchlist" className="underline font-medium">watchlist</Link>
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
                {new Date(movie.watched_date).toLocaleDateString()}
              </div>
              {movie.user_rating && (
                <div className={STYLES.flexCenter}>
                  <Star className="h-4 w-4 mr-1 fill-current text-yellow-500" />
                  {movie.user_rating}/10
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
          onEmotionClick={movieForm.handleEmotionClick}
          onRemoveEmotion={movieForm.handleRemoveEmotion}
          onEmotionDescriptionChange={movieForm.setEmotionDescription}
          showDateFirst={false}
        />

        {/* Recommended Movies */}
        {similarMovies && similarMovies.length > 0 && (
          <div className={STYLES.card}>
            <h3 className={STYLES.heading4} style={{ marginBottom: '12px' }}>
              If you enjoyed this movie's vibe, you might also like...
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {similarMovies.map((similar: any) => (
                <div
                  key={similar.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/movie-tmdb/${similar.id}`)}
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
                    Add to watchlist →
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
              Movie Information
            </h3>
            <span className={STYLES.textMuted}>{showDescription ? '−' : '+'}</span>
          </button>
          {showDescription && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              <div>
                <span className="font-medium text-gray-700">Release Date:</span>
                <span className="ml-2 text-gray-600">
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Runtime:</span>
                <span className="ml-2 text-gray-600">
                  {movie.runtime ? `${movie.runtime} minutes` : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Genres:</span>
                <span className="ml-2 text-gray-600">
                  {movie.genres?.map((genre: any) => genre.name).join(', ') || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">TMDB Rating:</span>
                <span className="ml-2 text-gray-600">
                  {movie.rating ? `${movie.rating.toFixed(1)}/10` : 'N/A'}
                </span>
              </div>
              {movie.overview && (
                <div>
                  <span className="font-medium text-gray-700">Overview:</span>
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

