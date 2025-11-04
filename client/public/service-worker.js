/**
 * 🔄 SERVICE WORKER ДЛЯ PWA
 * 
 * Обеспечивает оффлайн-функциональность и кэширование ресурсов
 */

const CACHE_NAME = 'cinemood-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
];

// Установка service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Service Worker: Cache failed', err);
      })
  );
  self.skipWaiting();
});

// Активация service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Перехват запросов (network-first стратегия)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ВАЖНО: НЕ обрабатываем API запросы и запросы к localhost через Service Worker
  // Service Worker должен работать только для статических ресурсов
  if (url.pathname.startsWith('/api/') || 
      url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' ||
      url.pathname.includes('.json') ||
      event.request.method !== 'GET') {
    // Для API запросов просто пропускаем - не обрабатываем
    return;
  }
  
  // Для остальных запросов используем network-first стратегию
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Клонируем ответ для кэша (только для успешных GET запросов)
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сеть недоступна, возвращаем из кэша
        return caches.match(event.request);
      })
  );
});

