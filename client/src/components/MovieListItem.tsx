import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Calendar, Star, User, Tag, Trash2 } from 'lucide-react';
import { STYLES } from '../constants/styles';
import { getTMDBPosterUrl } from '../utils/movieUtils';

/**
 * 📋 ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ ЭЛЕМЕНТА СПИСКА ФИЛЬМОВ
 * 
 * Используется в:
 * - MovieDiary - список просмотренных фильмов
 * - Watchlist - список фильмов к просмотру
 * 
 * Поддерживает разные конфигурации отображаемых полей
 */

interface MovieListItemProps {
  movie: any;
  linkTo: string;
  // Конфигурация отображаемых полей
  showDate?: boolean;
  showRating?: boolean;
  showDirector?: boolean;
  showOverview?: boolean;
  showGenres?: boolean;
  showEmotions?: boolean;
  showNotes?: boolean;
  // Функция для получения класса badge эмоций
  getEmotionBadgeClass?: (emotion: string) => string;
  onRemove?: (tmdbId: string | number) => void;
}

export const MovieListItem: React.FC<MovieListItemProps> = ({
  movie,
  linkTo,
  showDate = false,
  showRating = false,
  showDirector = false,
  showOverview = false,
  showGenres = false,
  showEmotions = false,
  showNotes = false,
  getEmotionBadgeClass,
  onRemove
}) => {
  // Получаем режиссера (если есть в crew или нужно будет получать из credits)
  const getDirector = () => {
    if (movie.director) return movie.director;
    if (movie.crew && Array.isArray(movie.crew)) {
      const director = movie.crew.find((person: any) => person.job === 'Director');
      return director?.name || null;
    }
    return null;
  };

  // Форматируем жанры
  const getGenresText = () => {
    if (!movie.genres || (!Array.isArray(movie.genres) && typeof movie.genres !== 'string')) {
      return null;
    }
    
    if (Array.isArray(movie.genres)) {
      return movie.genres.map((g: any) => g.name || g).join(', ');
    }
    
    // Если genres в формате JSON строки
    try {
      const parsed = JSON.parse(movie.genres);
      if (Array.isArray(parsed)) {
        return parsed.map((g: any) => g.name || g).join(', ');
      }
    } catch {
      return null;
    }
    
    return null;
  };

  const director = getDirector();
  const genresText = getGenresText();

  // Отладочное логирование отключено
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🎬 MovieListItem rendering:', {
  //     title: movie.title,
  //     director,
  //     genresText,
  //     showDirector,
  //     showGenres,
  //     showOverview,
  //     overview: movie.overview
  //   });
  // }

  const tmdbId = movie.tmdb_id || movie.id;

  return (
    <div className={`${STYLES.movieCard} relative`}> 
      {onRemove && (
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(tmdbId); }}
          aria-label="Remove from watchlist"
          title="Remove from watchlist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <Link to={linkTo} className="flex items-center">
      {/* Small Poster Icon */}
      <div className="relative w-16 h-20 sm:w-20 sm:h-28 flex-shrink-0 bg-gray-200 overflow-hidden rounded-l-xl">
        {movie.poster_path ? (
          <img
            src={getTMDBPosterUrl(movie.poster_path, 'w92')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Film className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">
              {movie.title}
              {movie.original_title_en && movie.original_title_en !== movie.title && (
                <span className="text-gray-500 font-normal text-sm"> ({movie.original_title_en})</span>
              )}
            </h3>
            
            {/* Дата просмотра */}
            {showDate && movie.watched_date && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(movie.watched_date).toLocaleDateString()}
              </div>
            )}

            {/* Режиссер */}
            {showDirector && director && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="h-3 w-3 mr-1" />
                <span>{director}</span>
              </div>
            )}

            {/* Жанры */}
            {showGenres && genresText && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Tag className="h-3 w-3 mr-1" />
                <span>{genresText}</span>
              </div>
            )}
          </div>
          
          {/* Рейтинг */}
          {showRating && movie.user_rating && (
            <div className="flex items-center text-yellow-600 flex-shrink-0">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium ml-0.5">{movie.user_rating}</span>
            </div>
          )}
        </div>

        {/* Описание */}
        {showOverview && movie.overview && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {movie.overview}
          </p>
        )}

        {/* Emotions */}
        {showEmotions && movie.emotions && movie.emotions.length > 0 && getEmotionBadgeClass && (
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.emotions.slice(0, 3).map((emotion: any, index: number) => (
              <span
                key={index}
                className={`emotion-badge ${getEmotionBadgeClass(emotion.type)}`}
              >
                {emotion.type}
              </span>
            ))}
            {movie.emotions.length > 3 && (
              <span className="emotion-badge bg-gray-100 text-gray-800">
                +{movie.emotions.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Notes Preview */}
        {showNotes && movie.notes && (
          <p className="text-sm text-gray-600 line-clamp-1">
            {movie.notes}
          </p>
        )}
      </div>
      </Link>
    </div>
  );
};

