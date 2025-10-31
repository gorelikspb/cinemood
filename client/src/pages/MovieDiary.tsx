import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Calendar,
  Film,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { STYLES } from '../constants/styles';
import { MovieListItem } from '../components/MovieListItem';
import { EmailModal } from '../components/EmailModal';

export const MovieDiary: React.FC = () => {
  const { language, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('watched_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage] = useState(1);
  const [showEmailBanner, setShowEmailBanner] = useState(
    typeof window !== 'undefined' && localStorage.getItem('rewatch-email-submitted') !== 'true'
  );
  const [showEmailModal, setShowEmailModal] = useState(false);

  const { data: movies, isLoading, error } = useQuery(
    ['movies', currentPage, sortBy, sortOrder, language],
    () => api.get('/movies', {
      params: {
        page: currentPage,
        limit: 12,
        sort: sortBy,
        order: sortOrder,
        language: language === 'ru' ? 'ru-RU' : 'en-US'
      }
    }).then(res => res.data),
    {
      staleTime: 0, // Always refetch when language changes
      cacheTime: 5 * 60 * 1000, // Keep cache for 5 minutes
      onError: (error) => {
        console.error('❌ Failed to load movies:', error);
      }
    }
  );

  const filteredMovies = movies?.filter((movie: any) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getEmotionBadgeClass = (emotion: string) => {
    const emotionClasses: { [key: string]: string } = {
      happy: 'emotion-happy',
      sad: 'emotion-sad',
      excited: 'emotion-excited',
      nostalgic: 'emotion-nostalgic',
      thoughtful: 'emotion-thoughtful',
      scared: 'emotion-scared',
      romantic: 'emotion-romantic',
      angry: 'emotion-angry',
    };
    return emotionClasses[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className={STYLES.page}>
        <div className={STYLES.loading}>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className={STYLES.gridResponsive}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={STYLES.movieCard}>
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
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
          <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`${STYLES.heading4} mb-2`}>
            Failed to load movies
          </h3>
          <p className={`${STYLES.textBody} mb-4`}>
            There was an error loading your movie diary.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className={STYLES.buttonPrimary}
          >
            Try Again
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
            {t.movieDiary}
          </h1>
          <p className={STYLES.textBody}>
            {t.personalCollection}
          </p>
        </div>
        <Link to="/add-movie" className={`${STYLES.buttonPrimary} mt-4 sm:mt-0`}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addMovie}
        </Link>
      </div>

      {/* Email Banner (only if email not submitted) */}
      {showEmailBanner && (
        <div className="card mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 text-center">
          <div className="py-5">
            <div className="text-4xl mb-2">📧</div>
            <p className={`${STYLES.textBody} mb-3`}>
              {t.wantToOpenDiaryFromOtherDevices}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowEmailBanner(false)}
                className={STYLES.buttonSecondary}
              >
                {t.later}
              </button>
              <button 
                onClick={() => setShowEmailModal(true)}
                className={STYLES.buttonPrimary}
              >
                {t.leaveEmail}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {/* <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchMovies}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div> */}

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="watched_date">{t.dateWatched}</option>
              <option value="title">{t.title}</option>
              <option value="user_rating">{t.rating}</option>
              <option value="created_at">{t.dateAdded}</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-field"
            >
              <option value="DESC">{t.newestFirst}</option>
              <option value="ASC">{t.oldestFirst}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies List */}
      {filteredMovies.length > 0 ? (
        <div className="space-y-3">
          {filteredMovies.map((movie: any) => (
            <MovieListItem
              key={movie.id}
              movie={movie}
              linkTo={`/movie/${movie.id}`}
              showDate={true}
              showRating={true}
              showEmotions={true}
              showNotes={true}
              getEmotionBadgeClass={getEmotionBadgeClass}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? t.noMoviesFound : t.noMoviesLogged}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? t.tryAdjustingSearch
              : t.startBuildingDiary
            }
          </p>
          {!searchTerm && (
            <Link to="/add-movie" className={STYLES.buttonPrimary}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstMovie}
            </Link>
          )}
        </div>
      )}

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={() => {
          setShowEmailModal(false);
          setShowEmailBanner(false);
        }}
      />
    </div>
  );
};

