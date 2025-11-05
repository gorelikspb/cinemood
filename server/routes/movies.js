const express = require('express');
const axios = require('axios');
const db = require('../database');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('🔧 Movies router initialized');

// Более точная проверка TMDB_API_KEY
const isTmdbConfigured = TMDB_API_KEY && 
                          TMDB_API_KEY !== 'your_tmdb_api_key_here' && 
                          TMDB_API_KEY.trim() !== '';

console.log('🔑 TMDB_API_KEY status:', isTmdbConfigured ? '✅ Configured' : '❌ Not configured');
if (isTmdbConfigured) {
  console.log('🔑 TMDB_API_KEY value: Custom value (hidden for security)');
} else {
  console.log('🔑 TMDB_API_KEY value: Not set or default placeholder');
}

// Get recommendations based on config type (gems, popular, trend)
router.get('/popular', async (req, res) => {
  try {
    const { language = 'en-US', page = 1, type } = req.query;
    
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(500).json({ error: 'TMDB API key not configured' });
    }

    // Используем тип из запроса (клиент передает его из config.ts)
    const recommendationType = type || 'popular'; // По умолчанию popular если не указано
    const count = 12; // Количество фильмов (можно передать через query параметр если нужно)

    console.log(`🎬 Fetching ${recommendationType} recommendations...`);
    
    // Логируем параметры фильтрации для gems
    if (recommendationType === 'gems') {
      console.log('🔍 Gems filters:', {
        minRating: req.query.minRating || 'not set',
        minVoteCount: req.query.minVoteCount || 'not set',
        maxVoteCount: req.query.maxVoteCount || 'not set',
        minReleaseDate: req.query.minReleaseDate || 'not set',
        requireRussianTitle: req.query.requireRussianTitle || 'false',
        excludeGenres: req.query.excludeGenres || 'none'
      });
    }

    let endpoint;
    let params = {
      api_key: TMDB_API_KEY,
      language,
      page: 1
    };

    // Выбираем endpoint и параметры в зависимости от типа
    if (recommendationType === 'gems') {
      // Скрытые жемчужины: хороший рейтинг, но не слишком популярные
      // Настройки приходят от клиента через query параметры (из config.ts)
      endpoint = 'discover/movie';
      
      // Маппинг названий жанров на ID TMDB
      const genreMap = {
        'Animation': 16,
        'Music': 10402,
        'Documentary': 99
      };
      
      // Если требуется русское название - запрашиваем на русском языке
      const requireRussianTitle = req.query.requireRussianTitle === 'true';
      if (requireRussianTitle) {
        params.language = 'ru-RU'; // Запрашиваем русскую локализацию
      }
      
      params.sort_by = 'vote_average.desc';
      params['vote_average.gte'] = parseFloat(req.query.minRating) || 6.9;
      params['vote_count.gte'] = parseInt(req.query.minVoteCount) || 50;
      params['vote_count.lte'] = parseInt(req.query.maxVoteCount) || 500;
      params['release_date.gte'] = req.query.minReleaseDate || '2010-01-01';
      
      // Исключаем жанры через параметр without_genres
      if (req.query.excludeGenres) {
        const excludeGenreNames = req.query.excludeGenres.split(',');
        const excludeGenreIds = excludeGenreNames
          .map(name => genreMap[name.trim()])
          .filter(id => id !== undefined);
        
        if (excludeGenreIds.length > 0) {
          params['without_genres'] = excludeGenreIds.join(',');
          console.log(`🚫 Excluding genres: ${excludeGenreNames.join(', ')} (IDs: ${excludeGenreIds.join(', ')})`);
        }
      }
      
      params.page = Math.floor(Math.random() * 5) + 1; // Случайная страница для разнообразия
    } else if (recommendationType === 'trend') {
      // Трендовые фильмы за неделю
      endpoint = 'trending/movie/week';
    } else {
      // Популярные фильмы (по умолчанию)
      endpoint = 'movie/popular';
    }

    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, { params });
    
    // Получаем все результаты от TMDB
    let movies = response.data.results || [];
    
    // ⚠️ ВАЖНО: Дополнительно фильтруем результаты для gems
    // TMDB API может вернуть фильмы, которые не полностью соответствуют параметрам
    if (recommendationType === 'gems') {
      const minRating = parseFloat(req.query.minRating) || 6.9;
      const minVoteCount = parseInt(req.query.minVoteCount) || 50;
      const maxVoteCount = parseInt(req.query.maxVoteCount) || 500;
      const minReleaseDate = req.query.minReleaseDate || '2010-01-01';
      const requireRussianTitle = req.query.requireRussianTitle === 'true';
      const excludeGenresParam = req.query.excludeGenres ? req.query.excludeGenres.split(',').map(g => g.trim()) : [];
      
      // Маппинг названий жанров на ID
      const genreMap = {
        'Animation': 16,
        'Music': 10402,
        'Documentary': 99
      };
      const excludeGenreIds = excludeGenresParam
        .map(name => genreMap[name])
        .filter(id => id !== undefined);
      
      console.log(`🔍 Genre filtering setup:`, {
        excludeGenresParam,
        excludeGenreIds,
        genreMap
      });
      
      const beforeFilter = movies.length;
      movies = movies.filter(movie => {
        // Проверяем рейтинг
        if (movie.vote_average && movie.vote_average < minRating) {
          return false;
        }
        
        // Проверяем количество оценок
        if (movie.vote_count !== undefined) {
          if (movie.vote_count < minVoteCount || movie.vote_count > maxVoteCount) {
            return false;
          }
        } else if (minVoteCount > 0) {
          // Если vote_count отсутствует, но требуется минимум - отбрасываем
          return false;
        }
        
        // Проверяем дату релиза
        if (movie.release_date && movie.release_date < minReleaseDate) {
          return false;
        }
        
        // Проверяем русское название
        // Если запросили на ru-RU, то title должно быть переведено (не совпадать с оригиналом)
        // ИЛИ original_language === 'ru'
        if (requireRussianTitle) {
          // Если запросили на русском, проверяем что название отличается от оригинала
          // или оригинальный язык - русский
          const hasRussianTitle = movie.original_language === 'ru' || 
                                  (movie.title && movie.original_title && movie.title !== movie.original_title);
          if (!hasRussianTitle) {
            return false;
          }
        }
        
        // Проверяем исключенные жанры (СТРОГАЯ проверка - фильмы с исключенными жанрами НЕ ДОЛЖНЫ проходить)
        if (excludeGenreIds.length > 0) {
          // Если у фильма нет genre_ids - оставляем его (не можем проверить)
          if (!movie.genre_ids || !Array.isArray(movie.genre_ids) || movie.genre_ids.length === 0) {
            console.log(`⚠️ Movie "${movie.title}" has no genre_ids - keeping it (cannot verify excluded genres)`);
          } else {
            // Проверяем, есть ли среди жанров фильма исключенные
            const hasExcludedGenre = movie.genre_ids.some(genreId => excludeGenreIds.includes(genreId));
            if (hasExcludedGenre) {
              // Логируем фильмы, которые отфильтровываются по жанрам
              const excludedGenreNames = excludeGenresParam.filter((name) => {
                const genreId = genreMap[name];
                return genreId && movie.genre_ids.includes(genreId);
              });
              console.log(`🚫❌ EXCLUDING "${movie.title}" - HAS EXCLUDED GENRES: ${excludedGenreNames.join(', ')} (genre_ids: [${movie.genre_ids.join(', ')}])`);
              return false; // ВАЖНО: возвращаем false, чтобы фильм НЕ попал в результаты
            }
          }
        }
        
        return true;
      });
      
      const afterFilter = movies.length;
      if (beforeFilter !== afterFilter) {
        console.log(`🔍 Filtered: ${beforeFilter} → ${afterFilter} movies (removed ${beforeFilter - afterFilter} that didn't match filters)`);
        
        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: проверяем, что в финальном списке НЕТ фильмов с исключенными жанрами
        if (excludeGenreIds.length > 0) {
          const hasExcludedInFinal = movies.some(movie => {
            if (!movie.genre_ids || !Array.isArray(movie.genre_ids)) return false;
            return movie.genre_ids.some(id => excludeGenreIds.includes(id));
          });
          
          if (hasExcludedInFinal) {
            console.error(`❌❌❌ ERROR: Found movies with excluded genres in final results! This should not happen!`);
            movies.forEach(movie => {
              if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
                const hasExcluded = movie.genre_ids.some(id => excludeGenreIds.includes(id));
                if (hasExcluded) {
                  const excludedNames = excludeGenresParam.filter((name) => {
                    const genreId = genreMap[name];
                    return genreId && movie.genre_ids.includes(genreId);
                  });
                  console.error(`  ❌ "${movie.title}" has excluded genres: ${excludedNames.join(', ')}`);
                }
              }
            });
          }
        }
      }
    }
    
    // Берем нужное количество фильмов ПОСЛЕ фильтрации
    movies = movies.slice(0, count);

    console.log(`✅ Got ${movies.length} ${recommendationType} recommendations`);
    
    // Детальное логирование каждого фильма
    console.log('\n📋 Recommended movies:');
    movies.forEach((movie, index) => {
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      const votes = movie.vote_count ? movie.vote_count.toLocaleString() : '0';
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
      const genres = movie.genre_ids && Array.isArray(movie.genre_ids) 
        ? movie.genre_ids.map(id => {
            const nameMap = { 16: 'Animation', 10402: 'Music', 99: 'Documentary', 28: 'Action', 12: 'Adventure', 35: 'Comedy', 80: 'Crime', 18: 'Drama', 14: 'Fantasy', 27: 'Horror', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War', 37: 'Western' };
            return nameMap[id] || `Genre${id}`;
          }).join(', ')
        : 'No genres';
      console.log(`  ${index + 1}. "${movie.title}" (${year}) - ⭐ ${rating}/10 - 👥 ${votes} votes - 🎭 [${genres}]`);
    });
    console.log(''); // Пустая строка для читаемости

    res.json({
      results: movies,
      total_results: movies.length,
      page: 1,
      total_pages: 1
    });
  } catch (error) {
    console.error('❌ Failed to fetch movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Search movies
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, language = 'en-US' } = req.query;
    
    console.log('🔍 Search request received:', { query, page, language });
    console.log('🔑 TMDB_API_KEY check:', {
      exists: !!TMDB_API_KEY,
      isPlaceholder: TMDB_API_KEY === 'your_tmdb_api_key_here',
      length: TMDB_API_KEY?.length || 0
    });
    
    if (!query) {
      console.log('❌ No query provided');
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Check if TMDB API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here' || !TMDB_API_KEY.trim()) {
      console.log('❌ TMDB API key not configured');
      console.log('❌ TMDB_API_KEY value:', TMDB_API_KEY || 'undefined');
      return res.status(500).json({ 
        error: 'TMDB API key not configured',
        details: 'Please set TMDB_API_KEY environment variable in Railway'
      });
    }

    console.log('🌐 Making request to TMDB API with language:', language);
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
        page,
        language: language
      }
    });

    console.log('📊 Raw TMDB results sample:', response.data.results.slice(0, 2).map(m => ({
      title: m.title,
      original_title: m.original_title,
      original_language: m.original_language
    })));

    // Enhance results with original titles for non-English languages
    const enhancedResults = response.data.results.map(movie => {
      if (language !== 'en-US' && movie.original_language === 'en') {
        return {
          ...movie,
          original_title: movie.title, // Store localized title (Russian)
          title: movie.title, // Keep localized title as main title
          original_title_en: movie.original_title // Store English original from TMDB
        };
      }
      return movie;
    });

    console.log('✅ TMDB API response received:', { 
      totalResults: response.data.total_results,
      results: enhancedResults.map(m => `${m.title}${m.original_title_en ? ` (${m.original_title_en})` : ''}`),
      language: language
    });

    res.json({
      ...response.data,
      results: enhancedResults
    });
  } catch (error) {
    console.error('❌ TMDB search error:', error.message);
    console.error('❌ Error details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// Get recommended movies
// Get similar movies based on user's diary movies (sorted by rating descending)
router.get('/recommendations/similar', async (req, res) => {
  try {
    const { language = 'en-US', limit = 50 } = req.query;
    
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.status(500).json({ error: 'TMDB API key not configured' });
    }

    // Get user's movies sorted by rating (descending), limit to top 10 rated movies
    const sql = `
      SELECT tmdb_id, user_rating 
      FROM movies 
      WHERE tmdb_id IS NOT NULL AND user_rating IS NOT NULL
      ORDER BY user_rating DESC, id DESC
      LIMIT 10
    `;
    
    db.all(sql, [], async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch movies' });
      }

      if (!rows || rows.length === 0) {
        return res.json({ results: [], empty: true });
      }

      console.log(`📊 Found ${rows.length} movies in diary for recommendations`);

      // Get similar movies for each movie
      const similarMoviesMap = new Map(); // Use Map to avoid duplicates by tmdb_id
      const seenTmdbIds = new Set(); // Track which movies we've already processed

      // First, add all user's movies to seenTmdbIds to exclude them from recommendations
      rows.forEach(row => {
        seenTmdbIds.add(row.tmdb_id);
      });

      // Fetch similar movies for each movie (limit to top 5-10 rated movies for performance)
      const topMovies = rows.slice(0, 5); // Use top 5 rated movies
      
      for (const row of topMovies) {
        try {
          const response = await axios.get(`${TMDB_BASE_URL}/movie/${row.tmdb_id}/recommendations`, {
            params: {
              api_key: TMDB_API_KEY,
              language: language,
              page: 1
            }
          });

          const similarMovies = response.data.results || [];
          
          // Add each similar movie to the map (avoiding duplicates and user's own movies)
          similarMovies.forEach((movie) => {
            if (!seenTmdbIds.has(movie.id)) {
              seenTmdbIds.add(movie.id);
              similarMoviesMap.set(movie.id, movie);
            }
          });
        } catch (error) {
          console.error(`Error fetching similar movies for tmdb_id ${row.tmdb_id}:`, error.message);
          // Continue with other movies even if one fails
        }
      }

      // Convert map to array and limit results
      const recommendations = Array.from(similarMoviesMap.values()).slice(0, parseInt(limit) || 50);
      
      console.log(`✅ Returning ${recommendations.length} unique recommendations`);
      
      res.json({ 
        results: recommendations,
        empty: false,
        sourceMoviesCount: rows.length
      });
    });
  } catch (error) {
    console.error('Similar recommendations error:', error);
    res.status(500).json({ error: 'Failed to get similar recommendations' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en-US' } = req.query;
    
    // Get tmdb_id from our database
    const sql = 'SELECT tmdb_id FROM movies WHERE id = ?';
    
    db.get(sql, [id], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch movie' });
      }

      if (!row || !row.tmdb_id) {
        return res.status(404).json({ error: 'Movie not found or has no TMDB ID' });
      }

      try {
        // Use recommendations instead of similar
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${row.tmdb_id}/recommendations`, {
          params: {
            api_key: TMDB_API_KEY,
            language: language,
            page: 1
          }
        });

        res.json(response.data);
      } catch (error) {
        console.error('TMDB recommendations error:', error.message);
        res.status(500).json({ error: 'Failed to get recommendations' });
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get movie details
router.get('/details/:tmdbId', async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const { language = 'en-US' } = req.query;
    
    // Check if TMDB API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      console.log('❌ TMDB API key not configured');
      return res.status(500).json({ error: 'TMDB API key not configured' });
    }
    
    // Fetch movie details and credits in parallel
    const [movieResponse, creditsResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: language
        }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/credits`, {
        params: {
          api_key: TMDB_API_KEY
        }
      }).catch(() => null) // Если credits не доступны, продолжаем без них
    ]);

    const movieData = movieResponse.data;
    
    // Extract director from credits if available
    if (creditsResponse && creditsResponse.data) {
      const director = creditsResponse.data.crew?.find(
        (person) => person.job === 'Director'
      );
      if (director) {
        movieData.director = director.name;
      }
      movieData.crew = creditsResponse.data.crew;
    }

    res.json(movieData);
  } catch (error) {
    console.error('TMDB details error:', error.message);
    res.status(500).json({ error: 'Failed to get movie details' });
  }
});

// Add movie to diary
router.post('/', (req, res) => {
  try {
    const {
      tmdb_id,
      title,
      overview,
      release_date,
      poster_path,
      backdrop_path,
      genres,
      rating,
      runtime,
      watched_date,
      user_rating,
      notes
    } = req.body;

    const sql = `
      INSERT INTO movies (
        tmdb_id, title, overview, release_date, poster_path, 
        backdrop_path, genres, rating, runtime, watched_date, 
        user_rating, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      tmdb_id, title, overview, release_date, poster_path,
      backdrop_path, JSON.stringify(genres), rating, runtime,
      watched_date, user_rating, notes
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to add movie' });
      }

      res.json({ 
        id: this.lastID, 
        message: 'Movie added successfully' 
      });
    });
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// Get all watched movies
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'watched_date', order = 'DESC', language = 'en-US' } = req.query;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT m.*, 
             GROUP_CONCAT(e.emotion_type || ':' || e.intensity) as emotions
      FROM movies m
      LEFT JOIN emotions e ON m.id = e.movie_id
      GROUP BY m.id
      ORDER BY m.${sort} ${order}
      LIMIT ? OFFSET ?
    `;

    db.all(sql, [limit, offset], async (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch movies' });
      }

      // Fetch localized titles from TMDB if tmdb_id exists
      const movies = await Promise.all(rows.map(async (row) => {
        let title = row.title;
        let original_title_en = row.original_title_en;
        
        // If we have tmdb_id, fetch current localized title from TMDB
        if (row.tmdb_id) {
          try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${row.tmdb_id}`, {
              params: {
                api_key: TMDB_API_KEY,
                language: language
              }
            });
            
            title = response.data.title;
            // Keep original English title for showing in parentheses if different
            if (language !== 'en-US' && response.data.original_language === 'en') {
              original_title_en = response.data.original_title;
            }
          } catch (error) {
            // Fall back to stored title if TMDB fetch fails
            console.error(`Failed to fetch localized title for tmdb_id ${row.tmdb_id}:`, error.message);
          }
        }
        
        return {
          ...row,
          title: title,
          original_title_en: original_title_en,
          genres: row.genres ? JSON.parse(row.genres) : [],
          emotions: row.emotions ? 
            row.emotions.split(',').map(e => {
              const [type, intensity] = e.split(':');
              return { type, intensity: parseInt(intensity) };
            }) : []
        };
      }));

      res.json(movies);
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en-US' } = req.query;

    const sql = `
      SELECT m.*, 
             GROUP_CONCAT(e.emotion_type || ':' || e.intensity || ':' || e.description) as emotions
      FROM movies m
      LEFT JOIN emotions e ON m.id = e.movie_id
      WHERE m.id = ?
      GROUP BY m.id
    `;

    db.get(sql, [id], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch movie' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // Fetch localized title from TMDB if tmdb_id exists
      let title = row.title;
      let original_title_en = row.original_title_en;
      
      if (row.tmdb_id) {
        try {
          const response = await axios.get(`${TMDB_BASE_URL}/movie/${row.tmdb_id}`, {
            params: {
              api_key: TMDB_API_KEY,
              language: language
            }
          });
          
          title = response.data.title;
          // Keep original English title for showing in parentheses if different
          if (language !== 'en-US' && response.data.original_language === 'en') {
            original_title_en = response.data.original_title;
          }
        } catch (error) {
          // Fall back to stored title if TMDB fetch fails
          console.error(`Failed to fetch localized title for tmdb_id ${row.tmdb_id}:`, error.message);
        }
      }

      const movie = {
        ...row,
        title: title,
        original_title_en: original_title_en,
        genres: row.genres ? JSON.parse(row.genres) : [],
        emotions: row.emotions ? 
          row.emotions.split(',').map(e => {
            const [type, intensity, description] = e.split(':');
            return { type, intensity: parseInt(intensity), description };
          }) : []
      };

      res.json(movie);
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Update movie
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_rating,
      notes,
      watched_date
    } = req.body;

    const sql = `
      UPDATE movies 
      SET user_rating = ?, notes = ?, watched_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [user_rating, notes, watched_date, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update movie' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json({ message: 'Movie updated successfully' });
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete movie
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM movies WHERE id = ?';

    db.run(sql, [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete movie' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json({ message: 'Movie deleted successfully' });
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

module.exports = router;

