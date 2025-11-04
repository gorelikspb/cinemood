import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';
import App from './App';
import { ANALYTICS_CONFIG } from './config/analytics';

// Google Analytics 4 инициализируется в index.html
// Проверка доступности gtag только в режиме дебага
if (typeof window !== 'undefined' && process.env.REACT_APP_ANALYTICS_DEBUG === 'true') {
  window.addEventListener('load', () => {
    if (typeof (window as any).gtag === 'function') {
      console.log('✅ Google Analytics gtag is available');
    } else {
      console.warn('⚠️ Google Analytics gtag is not available. Check index.html');
    }
  });
}

// Microsoft Clarity инициализируется в index.html

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Регистрация Service Worker для PWA
// В режиме разработки отключаем Service Worker чтобы не мешал API запросам
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        registration.update();
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // В режиме разработки отключаем все Service Workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service Worker unregistered for development');
    });
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);


