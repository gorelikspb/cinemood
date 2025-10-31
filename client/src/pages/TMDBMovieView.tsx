import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft,
  Calendar,
  Film,
  Plus,
  Mail,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { useAddToWatchlist } from '../hooks/useAddToWatchlist';
import { EmailModal } from '../components/EmailModal';
import { STYLES } from '../constants/styles';

export const TMDBMovieView: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  
  // Хук для добавления в watchlist с проверкой email
  const {
    showEmailModal,
    pendingMovieTitle,
    handleAddToWatchlist,
    handleEmailSuccess,
    handleCloseModal,
  } = useAddToWatchlist(); // Убрали callback, так как теперь есть отдельная кнопка для добавления в дневник

  const onAddToWatchlist = () => {
    console.log('🎬 Add to Watchlist clicked:', { tmdbId, movieTitle: movie?.title });
    // Используем хук для проверки email перед добавлением
    handleAddToWatchlist(tmdbId!, movie?.title);
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tmdbId]);

  // Fetch movie details from TMDB
  const { data: movie, isLoading } = useQuery(
    ['tmdb-movie', tmdbId, language],
    () => api.get(`/movies/details/${tmdbId}`, {
      params: {
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data),
    {
      enabled: !!tmdbId,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.movieNotFound}
          </h3>
          <button onClick={() => navigate(-1)} className="btn-primary">
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {movie.title}
              {movie.original_title_en && movie.original_title_en !== movie.title && (
                <span className="text-gray-500 font-normal text-base"> ({movie.original_title_en})</span>
              )}
            </h1>
            {movie.release_date && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <Calendar className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {new Date(movie.release_date).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Action Buttons */}
        <div className="card">
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/add-movie?tmdbId=${tmdbId}`)}
              className={`${STYLES.buttonPrimary} w-full flex items-center justify-center`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addMovieToDiary}
            </button>
            <button
              onClick={onAddToWatchlist}
              className={`${STYLES.buttonWatchlist} w-full flex items-center justify-center`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t.addToWatchlist}
            </button>
          </div>
        </div>

        {/* Email Modal */}
        <EmailModal
          isOpen={showEmailModal}
          onClose={handleCloseModal}
          onSuccess={handleEmailSuccess}
          movieTitle={pendingMovieTitle}
        />

        {/* Movie Poster and Info */}
        <div className="card">
          {/* Poster - Centered */}
          <div className="flex justify-center mb-6">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt={movie.title}
                className="w-48 rounded-lg shadow-md"
              />
            ) : (
              <div className="w-48 aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                <Film className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Overview - Full width */}
          {movie.overview && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">{t.overview}</h3>
              <p className="text-gray-700 text-base leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.genres}</h3>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre: any) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

