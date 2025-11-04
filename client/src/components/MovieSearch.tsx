import React from 'react';
import { Search, Film } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { getTMDBPosterUrl, getMovieYear } from '../utils/movieUtils';
import { STYLE_OBJECTS } from '../constants/styles';

/**
 * 🔍 ПЕРЕИСПОЛЬЗУЕМЫЙ КОМПОНЕНТ ПОИСКА ФИЛЬМОВ
 * 
 * 🎯 Где используется:
 * - AddMovie.tsx - основной поиск для добавления
 * - Watchlist.tsx - поиск для добавления в watchlist  
 * - Модальные окна быстрого добавления
 * - Любые другие места, где нужен поиск TMDB
 * 
 * 🔄 Как работает:
 * 1. Использует хук useMovieSearch для debounced поиска
 * 2. Показывает результаты в виде кликабельных карточек
 * 3. Вызывает callback при выборе фильма
 * 4. Поддерживает кастомизацию через пропы
 */

interface MovieSearchProps {
  // 🎯 ОБЯЗАТЕЛЬНЫЕ ПРОПЫ
  onMovieSelect: (movie: any) => void;           // Callback при выборе фильма
  
  // 🎨 ОПЦИОНАЛЬНАЯ КАСТОМИЗАЦИЯ
  placeholder?: string;                          // Плейсхолдер для input
  maxResults?: number;                           // Максимум результатов (по умолчанию 10)
  showYear?: boolean;                           // Показывать год фильма (по умолчанию true)
  showPoster?: boolean;                         // Показывать постер (по умолчанию true)
  compact?: boolean;                            // Компактный режим (меньше размеры)
  className?: string;                           // Дополнительные CSS классы
  
  // 🔧 ПРОДВИНУТЫЕ НАСТРОЙКИ
  autoFocus?: boolean;                          // Автофокус на input
  clearOnSelect?: boolean;                      // Очищать поиск после выбора (по умолчанию true)
  disabled?: boolean;                           // Отключить поиск
}

export const MovieSearch: React.FC<MovieSearchProps> = ({
  onMovieSelect,
  placeholder,
  maxResults = 10,
  showYear = true,
  showPoster = true,
  compact = false,
  className = '',
  autoFocus = false,
  clearOnSelect = true,
  disabled = false
}) => {
  const { t } = useTranslation();
  
  // 🔍 ИСПОЛЬЗУЕМ ХУК ПОИСКА
  // Вся логика debouncing, API запросов и кэширования инкапсулирована в хуке
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    searching, 
    showResults,
    hasResults,
    clearSearch
  } = useMovieSearch();

  // 🎯 ОБРАБОТЧИК ВЫБОРА ФИЛЬМА
  const handleMovieSelect = (movie: any) => {
    // Очищаем поиск если нужно
    if (clearOnSelect) {
      clearSearch();
    }
    
    // Вызываем callback родительского компонента
    onMovieSelect(movie);
  };

  // 📏 РАЗМЕРЫ В ЗАВИСИМОСТИ ОТ РЕЖИМА
  const posterSize = compact ? 'w-8 h-12' : 'w-12 h-18';
  const posterUrl = compact ? 'w92' : 'w154';
  const textSize = compact ? 'text-sm' : 'text-base';
  const iconSize = compact ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <div className={`${STYLE_OBJECTS.movieSearch.container} ${className}`}>
      {/* 🔎 ПОЛЕ ПОИСКА */}
      <div className={STYLE_OBJECTS.movieSearch.inputWrapper}>
        <Search className={STYLE_OBJECTS.movieSearch.searchIcon} />
        <input
          type="text"
          placeholder={placeholder || t.enterMovieTitle}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            ${STYLE_OBJECTS.movieSearch.input}
            ${disabled ? STYLE_OBJECTS.movieSearch.inputDisabled : ''}
            ${compact ? STYLE_OBJECTS.movieSearch.inputCompact : ''}
          `}
        />
      </div>

      {/* 📋 РЕЗУЛЬТАТЫ ПОИСКА */}
      {showResults && !disabled && (
        <div className={`
          ${STYLE_OBJECTS.movieSearch.resultsContainer}
          ${compact ? STYLE_OBJECTS.movieSearch.resultsContainerCompact : ''}
        `}>
          {searching ? (
            // 🔄 ЗАГРУЗКА
            <div className={STYLE_OBJECTS.movieSearch.loadingContainer}>
              <div className={STYLE_OBJECTS.movieSearch.loadingSpinner}></div>
              <p className={STYLE_OBJECTS.movieSearch.loadingText}>{t.loading}</p>
            </div>
          ) : hasResults ? (
            // ✅ РЕЗУЛЬТАТЫ
            <div className={STYLE_OBJECTS.movieSearch.resultsList}>
              {searchResults.slice(0, maxResults).map((movie: any) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className={`
                    ${STYLE_OBJECTS.movieSearch.resultItem}
                    ${compact ? STYLE_OBJECTS.movieSearch.resultItemCompact : ''}
                  `}
                >
                  {/* 🖼️ ПОСТЕР (опционально) */}
                  {showPoster && (
                    <div className={`${posterSize} ${STYLE_OBJECTS.movieSearch.posterContainer}`}>
                      {movie.poster_path ? (
                        <img
                          src={getTMDBPosterUrl(movie.poster_path, posterUrl)}
                          alt={movie.title}
                          className={`w-full h-full ${STYLE_OBJECTS.movieSearch.posterImage}`}
                        />
                      ) : (
                        <div className={`w-full h-full ${STYLE_OBJECTS.movieSearch.posterPlaceholder}`}>
                          <Film className={`${iconSize} text-gray-400`} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 📝 ИНФОРМАЦИЯ О ФИЛЬМЕ */}
                  <div className={STYLE_OBJECTS.movieSearch.movieInfo}>
                    <h4 className={`${STYLE_OBJECTS.movieSearch.movieTitle} ${textSize}`}>
                      {movie.title}
                      {/* Показываем оригинальное название если отличается */}
                      {movie.original_title && movie.original_title !== movie.title && (
                        <span className="text-gray-500 font-normal"> ({movie.original_title})</span>
                      )}
                    </h4>
                    
                    {/* 📅 ГОД (опционально) */}
                    {showYear && (
                      <p className={`${STYLE_OBJECTS.movieSearch.movieYear} ${compact ? 'text-xs' : 'text-sm'}`}>
                        {getMovieYear(movie.release_date)}
                      </p>
                    )}
                    
                    {/* 📊 РЕЙТИНГ TMDB (в компактном режиме) */}
                    {compact && movie.vote_average > 0 && (
                      <p className="text-xs text-gray-500">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
              
              {/* 📊 ПОКАЗАТЬ БОЛЬШЕ (если результатов много) */}
              {searchResults.length > maxResults && (
                <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                  Показано {maxResults} из {searchResults.length} результатов
                </div>
              )}
            </div>
          ) : (
            // ❌ НЕТ РЕЗУЛЬТАТОВ
            <div className={STYLE_OBJECTS.movieSearch.noResults}>
              <Film className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t.noMoviesFound}</p>
              <p className="text-xs text-gray-400 mt-1">{t.tryAdjustingSearch}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 🎨 ПРЕДУСТАНОВЛЕННЫЕ ВАРИАНТЫ для удобства

// Компактный поиск для модальных окон
export const CompactMovieSearch: React.FC<Omit<MovieSearchProps, 'compact'>> = (props) => (
  <MovieSearch {...props} compact={true} maxResults={5} />
);

// Поиск только с названиями (без постеров)
export const TextOnlyMovieSearch: React.FC<Omit<MovieSearchProps, 'showPoster'>> = (props) => (
  <MovieSearch {...props} showPoster={false} />
);

// Быстрый поиск с автофокусом
export const QuickMovieSearch: React.FC<Omit<MovieSearchProps, 'autoFocus'>> = (props) => (
  <MovieSearch {...props} autoFocus={true} />
);
