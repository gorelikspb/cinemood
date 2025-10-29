import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft,
  Calendar,
  Film,
  Plus,
  Mail
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

export const TMDBMovieView: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [justRegistered, setJustRegistered] = React.useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save email locally
    localStorage.setItem('rewatch-email', email);
    localStorage.setItem('rewatch-registered', 'true');
    setJustRegistered(true);
    setIsSubmitting(false);
  };

  const handleContinue = () => {
    // Hide registration message, show add to watchlist button
    setJustRegistered(false);
    navigate(`/add-movie?tmdbId=${tmdbId}`);
  };

  const handleAddToWatchlist = () => {
    // Get current watchlist
    const currentWatchlist = JSON.parse(localStorage.getItem('rewatch-watchlist') || '[]');
    
    // Add tmdbId to watchlist if not already there
    if (!currentWatchlist.includes(tmdbId)) {
      currentWatchlist.push(tmdbId);
      localStorage.setItem('rewatch-watchlist', JSON.stringify(currentWatchlist));
    }
    
    // Navigate to add movie page
    navigate(`/add-movie?tmdbId=${tmdbId}`);
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
            Movie not found
          </h3>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
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
        {/* Registration Form First */}
        <div className="card">
          {!justRegistered ? (
            <>
              {localStorage.getItem('rewatch-email') ? (
                // Already registered - show add to watchlist
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    Add this movie to your watchlist?
                  </h2>
                  <button
                    onClick={handleAddToWatchlist}
                    className="btn-primary w-full"
                  >
                    Add to Watchlist
                  </button>
                </div>
              ) : (
                // Not registered - show registration form
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    Want to save this movie to your diary?
                  </h2>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input-field"
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        We'll save your movie diary here ✨
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1"
                      >
                        {isSubmitting ? 'Registering...' : 'Register'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary flex-1"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Thanks for registering!
              </h2>
              <p className="text-gray-700 mb-4">
                You can now add movies to your watchlist and track your emotions.
              </p>
              <button
                onClick={handleContinue}
                className="btn-primary"
              >
                OK
              </button>
            </div>
          )}
        </div>

        {/* Movie Poster and Info */}
        <div className="card">
          <div className="flex gap-4">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                alt={movie.title}
                className="w-32 h-48 rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Film className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              {movie.overview && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Overview</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Genres</h3>
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

