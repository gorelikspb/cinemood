/**
 * 📊 КОНФИГУРАЦИЯ АНАЛИТИКИ
 * 
 * Настройки для Google Analytics 4 (бесплатно!)
 * 
 * Measurement ID можно получить в Google Analytics:
 * Admin → Data Streams → Web Stream → Measurement ID
 */

export const ANALYTICS_CONFIG = {
  // Measurement ID из Google Analytics (формат: G-XXXXXXXXXX)
  // Можно задать через переменную окружения или напрямую здесь
  measurementId: process.env.REACT_APP_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  
  // Включить аналитику (по умолчанию true)
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED !== 'false',
};

