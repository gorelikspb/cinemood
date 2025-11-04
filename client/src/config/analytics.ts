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
  // Значение берется из переменной окружения REACT_APP_GA4_MEASUREMENT_ID
  measurementId: process.env.REACT_APP_GA4_MEASUREMENT_ID || 'G-4B5R6S0DLK',
  
  // Включить аналитику (по умолчанию true)
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED !== 'false',
  
  // Включить дебаг-логи (по умолчанию false, установите REACT_APP_ANALYTICS_DEBUG=true для включения)
  debug: process.env.REACT_APP_ANALYTICS_DEBUG === 'true',

  // Microsoft Clarity
  clarityEnabled: process.env.REACT_APP_CLARITY_ENABLED !== 'false',
  clarityProjectId: process.env.REACT_APP_CLARITY_PROJECT_ID || 'u0dil3s5nz',
};

