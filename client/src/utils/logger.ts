/**
 * 📝 ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ЛОГИРОВАНИЯ
 * 
 * Простые функции для логирования с эмодзи и префиксами.
 * Легко отключить в продакшене или изменить уровень логирования.
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  // 🎬 Фильмы
  movieSelected: (title: string) => {
    if (isDev) console.log('🎬 Movie selected:', title);
  },
  
  movieLoaded: (title: string) => {
    if (isDev) console.log('✅ Movie loaded:', title);
  },
  
  movieSaved: (title: string, id?: number) => {
    if (isDev) console.log('💾 Movie saved:', title, id ? `(ID: ${id})` : '');
  },
  
  // 😊 Эмоции
  emotionAdded: (emotion: string) => {
    if (isDev) console.log('➕ Emotion added:', emotion);
  },
  
  emotionRemoved: (emotion: string) => {
    if (isDev) console.log('➖ Emotion removed:', emotion);
  },
  
  emotionsSaved: (emotions: string[]) => {
    if (isDev) console.log('😊 Emotions saved:', emotions);
  },
  
  // 🔍 Поиск
  searchStarted: (query: string) => {
    if (isDev) console.log('🔍 Search started:', query);
  },
  
  searchResults: (count: number) => {
    if (isDev) console.log('📋 Search results:', count, 'movies found');
  },
  
  // 🚀 Операции
  formSubmitted: (title: string) => {
    if (isDev) console.log('🚀 Form submitted for:', title);
  },
  
  formCompleted: () => {
    if (isDev) console.log('🎉 Form submission completed!');
  },
  
  // ❌ Ошибки
  error: (message: string, error?: any) => {
    if (isDev) console.error('❌', message, error);
  },
  
  // ⚠️ Предупреждения
  warn: (message: string) => {
    if (isDev) console.warn('⚠️', message);
  },
  
  // 📝 Общие
  info: (message: string, data?: any) => {
    if (isDev) console.log('ℹ️', message, data || '');
  },
  
  success: (message: string) => {
    if (isDev) console.log('✅', message);
  }
};
