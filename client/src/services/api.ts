import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Function to get current language
const getCurrentLanguage = () => {
  const savedLanguage = localStorage.getItem('rewatch-language'); // Match the key used in LanguageContext
  const language = savedLanguage === 'ru' ? 'ru-RU' : 'en-US';
  console.log('🌍 Language check:', { savedLanguage, language });
  return language;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('📋 Request data:', config.data);
    console.log('🔍 Request params BEFORE:', config.params);
    
    // Add language parameter to movie-related requests
    if (config.url?.includes('/movies/search') || config.url?.includes('/movies/details/') || config.url?.includes('/movies/popular')) {
      const language = getCurrentLanguage();
      config.params = {
        ...config.params,
        language: language
      };
      console.log('🌍 Added language parameter:', language);
    }
    
    console.log('🔍 Request params AFTER:', config.params);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from ${response.config.url}:`, response.status);
    console.log('📊 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error config:', error.config);
    return Promise.reject(error);
  }
);

export default api;

