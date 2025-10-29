import React from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { config } from '../config';
import { STYLES } from '../constants/styles';

/**
 * 🎬 Страница рекомендаций
 * 
 * Использует простую систему рекомендаций:
 * - 'gems' - скрытые жемчужины (хороший рейтинг, но не слишком популярные)
 * - 'popular' - популярные фильмы прямо сейчас
 * - 'trend' - трендовые фильмы за неделю
 * 
 * Настройка типа: client/src/config.ts (recommendationType)
 */
const Recommendations: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Fetch recommendations based on config.recommendationType
  const { data: movies, isLoading, error } = useQuery(
    ['recommendations', language, config.recommendationType, config.gems],
    () => {
      const params = new URLSearchParams({
        type: config.recommendationType,
        language: language
      });
      // Передаем настройки gems если выбран этот тип
      if (config.recommendationType === 'gems') {
        params.append('minRating', config.gems.minRating.toString());
        params.append('minVoteCount', config.gems.minVoteCount.toString());
        params.append('maxVoteCount', config.gems.maxVoteCount.toString());
        params.append('minReleaseDate', config.gems.minReleaseDate);
      }
      return api.get(`/movies/popular?${params}`).then(res => res.data.results || []);
    },
    {
      enabled: config.showRecommendations,
      staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    }
  );

  const handleMovieClick = (tmdbId: number) => {
    navigate(`/movie-tmdb/${tmdbId}`);
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

  return (
    <div className={STYLES.page}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.recommendations || 'Recommendations'}</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies?.map((movie: any) => (
          <div
            key={movie.id}
            onClick={() => handleMovieClick(movie.id)}
            className="cursor-pointer group"
          >
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
            <h3 className="text-sm font-medium text-gray-900 truncate">{movie.title}</h3>
            <p className="text-xs text-gray-500">{new Date(movie.release_date).getFullYear()}</p>
          </div>
        ))}
      </div>

      {(!movies || movies.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-600">{t.noRecommendationsAvailable || 'No recommendations available.'}</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

