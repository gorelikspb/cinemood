import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { config } from '../config';
import { STYLES } from '../constants/styles';
import { getGenresFromIds } from '../utils/movieUtils';
import { Plus, X } from 'lucide-react';

/**
 * 🎬 Страница рекомендаций
 * 
 * Показывает похожие фильмы к тем, что добавлены в дневнике (по убыванию оценки).
 * Если фильмов нет в дневнике, показывает сообщение с предложением добавить фильмы.
 */
const Recommendations: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [hiddenMovies, setHiddenMovies] = useState<Set<number>>(new Set());

  // Fetch similar movies based on user's diary movies
  const { data: recommendationsData, isLoading, error } = useQuery(
    ['recommendations-similar', language],
    () => {
      return api.get('/movies/recommendations/similar', {
        params: {
          language: language === 'ru' ? 'ru-RU' : 'en-US'
        }
      }).then(res => res.data);
    },
    {
      enabled: config.showRecommendations,
      staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    }
  );

  const allMovies = recommendationsData?.results || [];
  const isEmpty = recommendationsData?.empty === true;
  
  // Filter out hidden movies
  const movies = allMovies.filter((movie: any) => !hiddenMovies.has(movie.id));

  const handleMovieClick = (tmdbId: number) => {
    navigate(`/movie-tmdb/${tmdbId}`);
  };

  const handleHideMovie = (e: React.MouseEvent, movieId: number) => {
    e.stopPropagation(); // Prevent navigation when clicking X
    setHiddenMovies(prev => new Set(Array.from(prev).concat([movieId])));
  };

  if (!config.showRecommendations) {
    return (
      <div className={STYLES.page}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.recommendations}</h1>
          <p className="text-gray-600">{t.recommendationsDisabled || 'Recommendations are currently disabled.'}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={STYLES.page}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.recommendations}</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">{t.loading || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={STYLES.page}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.recommendations}</h1>
        <div className="text-center py-12">
          <p className="text-red-600">{t.errorLoading || 'Failed to load recommendations.'}</p>
        </div>
      </div>
    );
  }

  // Empty state: no movies in diary
  if (isEmpty) {
    return (
      <div className={STYLES.page}>
        <div className={`${STYLES.card} text-center`}>
          <div className="max-w-2xl mx-auto py-8">
            <div className="text-5xl mb-4">🎬</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.recommendations || 'Recommendations'}</h1>
            <p className={`${STYLES.textBody} mb-6 text-gray-700`}>
              {t.addMoviesForRecommendations || 'Add movies to your diary to get personalized recommendations based on films you enjoyed.'}
            </p>
            <Link to="/add-movie" className={`${STYLES.buttonPrimary} inline-flex items-center`}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstMovie || 'Add your first movie'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.page}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t.recommendationsBasedOnRatings || 'Recommendations based on your ratings'}
      </h1>
      
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie: any) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie.id)}
                className="cursor-pointer group relative"
              >
                {/* Hide button */}
                <button
                  onClick={(e) => handleHideMovie(e, movie.id)}
                  className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Hide recommendation"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <div className="aspect-[2/3] overflow-hidden rounded-lg mb-2 bg-gray-200">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No poster</span>
                    </div>
                  )}
                </div>
                {/* Жанры */}
                {movie.genre_ids && movie.genre_ids.length > 0 && (
                  <div className="mb-1 flex items-center justify-center gap-1 flex-wrap">
                    {getGenresFromIds(movie.genre_ids, 2).map((genre, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="text-sm font-medium text-gray-900 truncate">{movie.title}</h3>
                <p className="text-xs text-gray-500">{new Date(movie.release_date).getFullYear()}</p>
              </div>
            ))}
          </div>
          
          {/* Message after 6 recommendations */}
          {movies.length >= 6 && (
            <div className={`${STYLES.card} mt-8 text-center`}>
              <p className={`${STYLES.textBody} mb-4 text-gray-700`}>
                {t.wantMoreAccurateRecommendations || 'Want more accurate recommendations?'}
              </p>
              <Link to="/add-movie" className={`${STYLES.buttonSecondary} inline-flex items-center`}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addMoviesToDiary || 'Add movies to your diary'}
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">{t.noRecommendationsAvailable || 'No recommendations available.'}</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

