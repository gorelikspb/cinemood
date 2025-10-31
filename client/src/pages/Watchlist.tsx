import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Clock,
  Film,
  Plus,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { STYLES } from '../constants/styles';
import { MovieListItem } from '../components/MovieListItem';
import { removeFromWatchlist } from '../utils/movieUtils';
import { track, AnalyticsEvents } from '../utils/analytics';

export const Watchlist: React.FC = () => {
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [version, setVersion] = useState(0); // force refetch when list changes
  
  // Get watchlist from localStorage
  const watchlist = JSON.parse(localStorage.getItem('rewatch-watchlist') || '[]');
  
  // Fetch details for all movies in watchlist
  const { data: watchlistMovies, isLoading, error } = useQuery(
    ['watchlist-movies', watchlist, language, version],
    async () => {
      console.log('📋 Fetching watchlist movies:', watchlist);
      const movieDetails = await Promise.all(
        watchlist.map(async (tmdbId: string) => {
          try {
            const response = await api.get(`/movies/details/${tmdbId}`, {
              params: { language: language === 'ru' ? 'ru-RU' : 'en-US' }
            });
            console.log(`✅ Loaded movie ${tmdbId}:`, {
              title: response.data.title,
              director: response.data.director,
              genres: response.data.genres,
              overview: response.data.overview?.substring(0, 50)
            });
            return { ...response.data, tmdb_id: tmdbId };
          } catch (error) {
            console.error(`❌ Failed to load movie ${tmdbId}:`, error);
            return null;
          }
        })
      );
      const filtered = movieDetails.filter(Boolean);
      console.log('📊 Watchlist movies loaded:', filtered.length);
      return filtered;
    },
    {
      enabled: watchlist.length > 0,
      staleTime: 5 * 60 * 1000,
    }
  );

  const filteredMovies = watchlistMovies?.filter((movie: any) =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRemove = (tmdbId: string | number) => {
    removeFromWatchlist(tmdbId);
    
    // Трекинг: фильм удален из watchlist
    track(AnalyticsEvents.RemoveFromWatchlist, {
      movieId: tmdbId.toString(),
    });
    
    setVersion(v => v + 1);
  };

  if (isLoading) {
    return (
      <div className={STYLES.page}>
        <div className={STYLES.loading}>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="movie-card flex items-center">
                <div className="w-20 h-28 bg-gray-200 rounded-l-xl"></div>
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={STYLES.page}>
        <div className={STYLES.emptyState}>
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`${STYLES.heading4} mb-2`}>
            {t.failedToLoadWatchlist}
          </h3>
          <p className={`${STYLES.textBody} mb-4`}>
            {t.watchlistErrorDescription}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className={STYLES.buttonPrimary}
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.page}>
      {/* Header */}
      <div className={`${STYLES.flexBetween} flex-col sm:flex-row mb-8`}>
        <div>
          <h1 className={`${STYLES.heading1} mb-2`}>
            {t.myWatchlist}
          </h1>
          <p className={STYLES.textBody}>
            {t.watchlistDescription}
          </p>
        </div>
        <Link to="/add-movie?from=watchlist" className={`${STYLES.buttonPrimary} mt-4 sm:mt-0 flex items-center`}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addMore}
        </Link>
      </div>

      {/* Search */}
      {watchlist.length > 0 && (
        <div className={`${STYLES.card} mb-6`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchWatchlist}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${STYLES.inputField} pl-10`}
            />
          </div>
        </div>
      )}

      {/* Movies List */}
      {filteredMovies.length > 0 ? (
        <div className="space-y-3">
          {filteredMovies.map((movie: any) => {
            console.log('🎬 Rendering movie item:', movie.title, movie);
            return (
              <MovieListItem
                key={movie.tmdb_id || movie.id}
                movie={movie}
                linkTo={`/add-movie?tmdbId=${movie.tmdb_id || movie.id}&from=watchlist`}
                showDirector={true}
                showOverview={true}
                showGenres={true}
                onRemove={(id) => handleRemove(id)}
              />
            );
          })}
        </div>
      ) : watchlist.length > 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {t.noMoviesFoundReload}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className={`${STYLES.buttonPrimary} mt-4`}
          >
            {t.reloadPage}
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? t.noMoviesFound : t.watchlistEmpty}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? t.tryAdjustingSearch
              : t.watchlistEmptyDescription
            }
          </p>
          {!searchTerm && (
            <Link to="/recommendations" className={STYLES.buttonPrimary}>
              <Plus className="h-4 w-4 mr-2" />
              {t.browseRecommendations}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};



