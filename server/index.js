const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const movieRoutes = require('./routes/movies');
const emotionRoutes = require('./routes/emotions');
const statsRoutes = require('./routes/stats');
const emailRoutes = require('./routes/emails');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration (должно быть ПЕРЕД rate limiting)
const corsOptions = {
  origin: function (origin, callback) {
    // В development разрешаем localhost
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    // В production разрешаем указанный CLIENT_URL или любой Netlify домен
    const allowedOrigins = [
      process.env.CLIENT_URL,
      // Разрешаем любой Netlify домен
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.netlify\.app\/?$/
    ].filter(Boolean);
    
    // Если origin не указан (например, Postman), разрешаем
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Проверяем, разрешен ли origin
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting - более мягкие настройки для разработки
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // 1000 запросов в dev, 100 в production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Возвращать информацию о лимите в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключить заголовки `X-RateLimit-*`
  skip: (req) => {
    // Пропускаем health check из лимита
    return req.path === '/api/health';
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/emotions', emotionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🎬 Rewatch server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});


