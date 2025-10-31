import { useState, useCallback } from 'react';
import { addToWatchlist } from '../utils/movieUtils';
import { track, AnalyticsEvents } from '../utils/analytics';

/**
 * 🎬 ХУК ДЛЯ ДОБАВЛЕНИЯ ФИЛЬМА В WATCHLIST С ПРОВЕРКОЙ EMAIL
 * 
 * Используется везде, где нужно добавить фильм в watchlist.
 * Сначала проверяет, был ли отправлен email.
 * Если нет - показывает модальное окно для ввода email.
 * После отправки email - добавляет фильм в watchlist.
 */
export const useAddToWatchlist = (onAfterAdd?: (tmdbId: string | number) => void) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingMovieId, setPendingMovieId] = useState<string | number | null>(null);
  const [pendingMovieTitle, setPendingMovieTitle] = useState<string | undefined>(undefined);

  /**
   * Проверяет наличие email и либо показывает модальное окно,
   * либо сразу добавляет фильм в watchlist.
   */
  const handleAddToWatchlist = useCallback((tmdbId: string | number, movieTitle?: string) => {
    // Проверяем наличие email в localStorage
    const emailSubmitted = localStorage.getItem('rewatch-email-submitted') === 'true';
    
    console.log('🔍 Checking email status:', {
      emailSubmitted,
      localStorageValue: localStorage.getItem('rewatch-email-submitted'),
      tmdbId,
      movieTitle
    });

    if (!emailSubmitted) {
      // Email не был отправлен - показываем модальное окно
      console.log('📧 Email not submitted, showing modal');
      setPendingMovieId(tmdbId);
      setPendingMovieTitle(movieTitle);
      setShowEmailModal(true);
    } else {
      // Email уже был отправлен - сразу добавляем в watchlist
      console.log('✅ Email already submitted, adding to watchlist directly');
      addToWatchlist(tmdbId);
      
      // Трекинг: фильм добавлен в watchlist
      track(AnalyticsEvents.AddToWatchlist, {
        movieId: tmdbId.toString(),
      });
      
      if (onAfterAdd) {
        onAfterAdd(tmdbId);
      }
    }
  }, [onAfterAdd]);

  /**
   * Вызывается после успешной отправки email.
   * Добавляет фильм в watchlist и закрывает модальное окно.
   */
  const handleEmailSuccess = useCallback(() => {
    if (pendingMovieId) {
      addToWatchlist(pendingMovieId);
      
      // Трекинг: фильм добавлен в watchlist после отправки email
      track(AnalyticsEvents.AddToWatchlist, {
        movieId: pendingMovieId.toString(),
        afterEmail: 'true',
      });
      
      if (onAfterAdd) {
        onAfterAdd(pendingMovieId);
      }
      setPendingMovieId(null);
      setPendingMovieTitle(undefined);
    }
  }, [pendingMovieId, onAfterAdd]);

  const handleCloseModal = useCallback(() => {
    setShowEmailModal(false);
    setPendingMovieId(null);
    setPendingMovieTitle(undefined);
  }, []);

  return {
    showEmailModal,
    pendingMovieTitle,
    handleAddToWatchlist,
    handleEmailSuccess,
    handleCloseModal,
  };
};

