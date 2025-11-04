/**
 * 📊 АНАЛИТИКА GOOGLE ANALYTICS 4
 * 
 * Хелпер для отслеживания событий через Google Analytics 4 (gtag.js).
 * Поддерживает кастомные события с параметрами.
 */

import { ANALYTICS_CONFIG } from '../config/analytics';

// Типы для gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Отслеживает событие в Google Analytics 4
 * @param event - Название события (например, 'AddFilm')
 * @param params - Дополнительные параметры события (опционально)
 */
export const track = (event: string, params?: Record<string, string | number>): void => {
  // Проверяем, включена ли аналитика
  if (!ANALYTICS_CONFIG.enabled) {
    if (ANALYTICS_CONFIG.debug) {
      console.log('📊 Analytics disabled, skipping event:', event);
    }
    return;
  }

  // Логируем только если включен дебаг
  if (ANALYTICS_CONFIG.debug) {
    console.log('📊 Track event:', event, params || '');
  }

  // Проверяем, доступен ли gtag
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      if (params) {
        window.gtag('event', event, params);
        if (ANALYTICS_CONFIG.debug) {
          console.log('✅ Event sent to GA:', event, params);
        }
      } else {
        window.gtag('event', event);
        if (ANALYTICS_CONFIG.debug) {
          console.log('✅ Event sent to GA:', event);
        }
      }
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
    }
  } else {
    // Только в режиме дебага показываем предупреждения
    if (ANALYTICS_CONFIG.debug) {
      console.warn('⚠️ gtag not available. Is Google Analytics loaded?');
      console.warn('   Check if Measurement ID is correct:', ANALYTICS_CONFIG.measurementId);
    }
  }

  // Отправляем событие в Microsoft Clarity (если подключено)
  if (typeof window !== 'undefined' && typeof window.clarity === 'function' && ANALYTICS_CONFIG.clarityEnabled) {
    try {
      // clarity('event', name, params)
      window.clarity('event', event, params || {});
    } catch (error) {
      // Ошибки Clarity не критичны
    }
  }
};

/**
 * Отслеживает переход на страницу (для SPA)
 * @param path - путь страницы
 * @param title - заголовок страницы (опционально)
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!ANALYTICS_CONFIG.enabled) {
    return;
  }

  if (typeof window !== 'undefined' && window.gtag) {
    try {
      // Используем Measurement ID из конфига или из переменной окружения
      const measurementId = ANALYTICS_CONFIG.measurementId !== 'G-XXXXXXXXXX' 
        ? ANALYTICS_CONFIG.measurementId 
        : process.env.REACT_APP_GA4_MEASUREMENT_ID;
      
      if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
        window.gtag('config', measurementId, {
          page_path: path,
          page_title: title || document.title,
        });
      }
    } catch (error) {
      console.error('Page view tracking error:', error);
    }
  }
};

/**
 * Предопределенные события для удобства
 */
export const AnalyticsEvents = {
  // Фильмы
  AddFilm: 'AddFilm',
  EditFilm: 'EditFilm',
  DeleteFilm: 'DeleteFilm',
  
  // Эмоции
  AddEmotion: 'AddEmotion',
  RemoveEmotion: 'RemoveEmotion',
  
  // Похожие фильмы
  OpenSimilar: 'OpenSimilar',
  
  // Email
  EmailSubmitted: 'EmailSubmitted',
  
  // PWA
  InstallPromptShown: 'InstallPromptShown',
  InstalledPWA: 'InstalledPWA',
  
  // Watchlist
  AddToWatchlist: 'AddToWatchlist',
  RemoveFromWatchlist: 'RemoveFromWatchlist',
  
  // Обратная связь
  FeedbackSubmitted: 'FeedbackSubmitted',
} as const;

