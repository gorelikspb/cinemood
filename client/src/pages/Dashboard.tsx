import React from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, 
  Heart, 
  Calendar,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { STYLES } from '../constants/styles';
import { config } from '../config';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  const { data: allMovies, isLoading: moviesLoading } = useQuery(
    ['recent-movies', language],
    () => api.get('/movies?limit=5', {
      params: {
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data),
    {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
    }
  );

  const moviesCount = allMovies?.length || 0;
  
  // Get popular movies when user has no movies (if enabled in config)
  const { data: popularMovies, isLoading: popularLoading } = useQuery(
    ['popular-movies', language, config.recommendationType, config.gems],
    () => {
      const params: any = {
        language: language === 'ru' ? 'ru-RU' : 'en-US',
        page: 1,
        type: config.recommendationType
      };
      // Передаем настройки gems если выбран этот тип
      if (config.recommendationType === 'gems') {
        params.minRating = config.gems.minRating;
        params.minVoteCount = config.gems.minVoteCount;
        params.maxVoteCount = config.gems.maxVoteCount;
        params.minReleaseDate = config.gems.minReleaseDate;
      }
      return api.get('/movies/popular', { params }).then(res => res.data.results.slice(0, 8));
    },
    {
      enabled: moviesCount === 0 && config.showRecommendations, // Only fetch when user has no movies and feature is enabled
      staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    }
  );
  const showStatistics = moviesCount >= 5;
  const showEmailBanner = moviesCount >= 3;
  
  const [email, setEmail] = React.useState('');
  const [showEmailForm, setShowEmailForm] = React.useState(false);

  const { data: overviewStats, isLoading: statsLoading } = useQuery(
    'overview-stats',
    () => api.get('/stats/overview').then(res => res.data),
    { enabled: showStatistics }
  );

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery(
    'monthly-stats',
    () => api.get('/stats/monthly').then(res => res.data),
    { enabled: showStatistics }
  );

  const { data: emotionStats, isLoading: emotionLoading } = useQuery(
    'emotion-stats',
    () => api.get('/emotions/stats/overview').then(res => res.data),
    { enabled: showStatistics }
  );

  const recentMovies = allMovies;

  // Get all movies for emotions summary
  const { data: allMoviesData } = useQuery(
    ['all-movies-for-emotions', language],
    () => api.get('/movies?limit=1000', {
      params: {
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data),
    {
      staleTime: 0,
      cacheTime: 5 * 60 * 1000,
    }
  );

  // Calculate emotions summary
  const emotionsSummary = React.useMemo(() => {
    if (!allMoviesData) return [];
    
    const emotionCounts: { [key: string]: number } = {};
    
    allMoviesData.forEach((movie: any) => {
      if (movie.emotions && Array.isArray(movie.emotions)) {
        movie.emotions.forEach((emotion: any) => {
          emotionCounts[emotion.type] = (emotionCounts[emotion.type] || 0) + 1;
        });
      }
    });

    return Object.entries(emotionCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [allMoviesData]);

  // Get summary message based on top emotions
  const getSummaryMessage = () => {
    const topEmotions = emotionsSummary.slice(0, 2);
    if (topEmotions.length === 0) return null;
    
    const emotionText = topEmotions.map(e => e.type).join(' and ');
    return `Looks like you prefer ${emotionText} stories 😉`;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Save to localStorage
    localStorage.setItem('rewatch-email', email);
    setShowEmailForm(false);
    alert('Thank you! Your email has been saved.');
  };

  if (statsLoading || monthlyLoading || emotionLoading || moviesLoading) {
    return (
      <div className={STYLES.page}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pieData = emotionStats?.map((emotion: any, index: number) => ({
    name: emotion.emotion_type,
    value: emotion.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className={STYLES.page}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`${STYLES.heading1} mb-2`}>
          {t.welcomeBack}
        </h1>
        <p className={`${STYLES.textBody} text-sm sm:text-base`}>
          {t.movieJourney}
        </p>
      </div>

      {/* Top-Rated Movies Recommendations (when no movies logged yet) */}
      {config.showRecommendations && moviesCount === 0 && (
        <div className={`${STYLES.card} mb-8`}>
          <h2 className={`${STYLES.heading2} mb-4`}>🎬 Start Your Movie Journey</h2>
          <p className={`${STYLES.textBody} mb-4`}>Here are some critically acclaimed films to get you started:</p>
          {popularLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="cursor-pointer group">
                  <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse" />
                  <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : popularMovies && popularMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularMovies.map((movie: any) => {
                // Логируем для отладки
                if (process.env.NODE_ENV === 'development') {
                  console.log('🎬 Movie in recommendations:', {
                    title: movie.title,
                    vote_average: movie.vote_average,
                    vote_count: movie.vote_count
                  });
                }
                
                return (
                  <div 
                    key={movie.id} 
                    className="cursor-pointer group"
                    onClick={() => navigate(`/movie-tmdb/${movie.id}`)}
                  >
                    <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden relative">
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Film className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    {/* Рейтинг и оценки - главная информация */}
                    <div className="mt-2 flex items-center justify-center gap-3">
                      {movie.vote_average !== undefined && movie.vote_average > 0 ? (
                        <>
                          <div className="flex items-center text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-base font-bold ml-1">{movie.vote_average.toFixed(1)}</span>
                          </div>
                          {movie.vote_count !== undefined && movie.vote_count > 0 && (
                            <span className="text-sm text-gray-700 font-semibold">
                              {movie.vote_count.toLocaleString()} {movie.vote_count === 1 ? t.vote : t.votes}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No ratings</span>
                      )}
                    </div>
                    {/* Название фильма - меньше и ниже */}
                    <div className="mt-1.5 text-xs text-gray-700 text-center line-clamp-2">
                      {movie.title}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Failed to load recommendations</p>
          )}
        </div>
      )}

      {/* Email Banner */}
      {showEmailBanner && !showEmailForm && (
        <div className="card mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
          <div className="text-center py-6">
            <div className="text-5xl mb-3">💌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want to save your emotions and get mood-based picks?
            </h3>
            <p className="text-gray-700 mb-4">
              Add your email — I'll send you your movie memories ❤️
            </p>
            <button
              onClick={() => setShowEmailForm(true)}
              className="btn-primary"
            >
              Add Email
            </button>
          </div>
        </div>
      )}

      {/* Email Form */}
      {showEmailForm && (
        <div className="card mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary flex-1">
                Send
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="btn-secondary flex-1"
              >
                Maybe Later
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      {showStatistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="card p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t.moviesWatched}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {overviewStats?.movies?.total_movies || 0}
              </p>
            </div>
            <Film className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
          </div>
        </div>

        <div className="card p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t.averageRating}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {overviewStats?.movies?.avg_user_rating 
                  ? overviewStats.movies.avg_user_rating.toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          </div>
        </div>

        <div className="card p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t.emotionsTracked}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {overviewStats?.emotions?.total_emotions || 0}
              </p>
            </div>
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
          </div>
        </div>

        <div className="card p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{t.watchDays}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {overviewStats?.movies?.unique_watch_days || 0}
              </p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          </div>
        </div>
      </div>
      )}

      {/* Charts Row */}
      {showStatistics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Movies Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Movies Watched This Year
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="movies_watched" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Emotion Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emotion Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="text-4xl mr-3">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t.statisticsUnlockAt} ({moviesCount}/5)
                </p>
              </div>
            </div>
            <Link to="/add-movie" className="btn-primary inline-flex items-center px-4 py-2 text-sm">
              {t.addMovie}
            </Link>
          </div>
        </div>
      )}

      {/* Emotions Summary */}
      {emotionsSummary.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Emotions Over Time
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {emotionsSummary.map(({ type, count }) => (
              <div key={type} className="flex items-center space-x-2">
                <span className="text-2xl">
                  {type === 'happy' ? '😊' :
                   type === 'sad' ? '😢' :
                   type === 'excited' ? '🤩' :
                   type === 'nostalgic' ? '🥺' :
                   type === 'thoughtful' ? '🤔' :
                   type === 'scared' ? '😨' :
                   type === 'romantic' ? '🥰' :
                   type === 'angry' ? '😠' :
                   type === 'surprised' ? '😲' :
                   type === 'disgusted' ? '🤢' :
                   type === 'tense' ? '😰' :
                   type === 'shocked' ? '😱' :
                   type === 'thrilled' ? '😍' :
                   type === 'melancholic' ? '😔' :
                   type === 'peaceful' ? '😌' : '😐'}
                </span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{type}</p>
                  <p className="text-sm text-gray-600">{count} {count === 1 ? 'time' : 'times'}</p>
                </div>
              </div>
            ))}
          </div>
          {getSummaryMessage() && (
            <p className="text-gray-600 text-center italic">
              {getSummaryMessage()}
            </p>
          )}
        </div>
      )}

      {/* Recent Movies */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.recentMovies}
          </h3>
          <Link 
            to="/diary" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t.viewAll} →
          </Link>
        </div>

        {recentMovies?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMovies.map((movie: any) => (
              <div key={movie.id} className="movie-card">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                        <Film className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {movie.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(movie.watched_date).toLocaleDateString()}
                      </p>
                      {movie.user_rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {movie.user_rating}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No movies logged yet</p>
            <Link to="/add-movie" className="btn-primary">
              Add Your First Movie
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

