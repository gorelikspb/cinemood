import React from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  Heart,
  Star,
  Film
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];

export const Statistics: React.FC = () => {
  const { data: overviewStats, isLoading: overviewLoading } = useQuery(
    'overview-stats',
    () => api.get('/stats/overview').then(res => res.data)
  );

  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery(
    'monthly-stats',
    () => api.get('/stats/monthly').then(res => res.data)
  );

  const { data: genreStats, isLoading: genreLoading } = useQuery(
    'genre-stats',
    () => api.get('/stats/genres').then(res => res.data)
  );

  const { data: emotionStats, isLoading: emotionLoading } = useQuery(
    'emotion-stats',
    () => api.get('/emotions/stats/overview').then(res => res.data)
  );

  const { isLoading: trendsLoading } = useQuery(
    'emotion-trends',
    () => api.get('/stats/emotion-trends').then(res => res.data)
  );

  const { data: topEmotional, isLoading: topEmotionalLoading } = useQuery(
    'top-emotional',
    () => api.get('/stats/top-emotional?limit=10').then(res => res.data)
  );

  const { data: streakData, isLoading: streakLoading } = useQuery(
    'streak',
    () => api.get('/stats/streak').then(res => res.data)
  );

  if (overviewLoading || monthlyLoading || genreLoading || emotionLoading || trendsLoading || topEmotionalLoading || streakLoading) {
    return (
      <div className="p-6">
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

  // Prepare data for charts
  const emotionPieData = emotionStats?.map((emotion: any, index: number) => ({
    name: emotion.emotion_type,
    value: emotion.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const genreBarData = genreStats?.slice(0, 10).map((genre: any) => ({
    name: genre.genre_name,
    count: genre.count,
    avgRating: genre.avg_rating?.toFixed(1) || 0
  })) || [];

  const emotionRadarData = emotionStats?.map((emotion: any) => ({
    emotion: emotion.emotion_type,
    count: emotion.count,
    avgIntensity: emotion.avg_intensity?.toFixed(1) || 0
  })) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Statistics & Insights
        </h1>
        <p className="text-gray-600">
          Deep dive into your movie watching patterns and emotional journey
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Movies</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats?.movies?.total_movies || 0}
              </p>
            </div>
            <Film className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats?.movies?.avg_user_rating?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emotions Tracked</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats?.emotions?.total_emotions || 0}
              </p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {streakData?.current_streak || 0} days
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Movies */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Movies Watched Over Time
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
                data={emotionPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {emotionPieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Genre Preferences */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Genre Preferences
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Radar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Emotional Profile
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={emotionRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="emotion" />
              <PolarRadiusAxis />
              <Radar
                name="Intensity"
                dataKey="avgIntensity"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Emotional Movies */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Most Emotional Movies
        </h3>
        {topEmotional && topEmotional.length > 0 ? (
          <div className="space-y-4">
            {topEmotional.map((movie: any, index: number) => (
              <div key={movie.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-primary-600">
                    #{index + 1}
                  </span>
                </div>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <Film className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{movie.title}</h4>
                  <p className="text-sm text-gray-600">
                    Watched: {new Date(movie.watched_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium capitalize">{movie.emotion_type}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Avg Intensity: {movie.avg_intensity?.toFixed(1)}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No emotional data available yet. Start tracking emotions for your movies!
            </p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Personal Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Most Watched Genre</h4>
              <p className="text-blue-800">
                {genreStats?.[0]?.genre_name || 'N/A'} 
                {genreStats?.[0] && ` (${genreStats[0].count} movies)`}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Most Common Emotion</h4>
              <p className="text-green-800">
                {emotionStats?.[0]?.emotion_type || 'N/A'}
                {emotionStats?.[0] && ` (${emotionStats[0].count} times)`}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Average Movie Rating</h4>
              <p className="text-purple-800">
                {overviewStats?.movies?.avg_user_rating?.toFixed(1) || 'N/A'} out of 10
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Watch Frequency</h4>
              <p className="text-orange-800">
                {overviewStats?.movies?.total_movies && overviewStats?.movies?.unique_watch_days
                  ? `${(overviewStats.movies.total_movies / overviewStats.movies.unique_watch_days).toFixed(1)} movies per day`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

