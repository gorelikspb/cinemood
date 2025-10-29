const express = require('express');
const axios = require('axios');
const db = require('../database');

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('🔧 Movies router initialized');
console.log('🔑 TMDB_API_KEY status:', TMDB_API_KEY ? 'Configured' : 'Not configured');
console.log('🔑 TMDB_API_KEY value:', TMDB_API_KEY === 'your_tmdb_api_key_here' ? 'Default placeholder' : 'Custom value');

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
      params.sort_by = 'vote_average.desc';
      params['vote_average.gte'] = parseFloat(req.query.minRating) || 6.9;
      params['vote_count.gte'] = parseInt(req.query.minVoteCount) || 50;
      params['vote_count.lte'] = parseInt(req.query.maxVoteCount) || 500;
      params['release_date.gte'] = req.query.minReleaseDate || '2010-01-01';
      params.page = Math.floor(Math.random() * 5) + 1; // Случайная страница для разнообразия
    } else if (recommendationType === 'trend') {
      // Трендовые фильмы за неделю
      endpoint = 'trending/movie/week';
    } else {
      // Популярные фильмы (по умолчанию)
      endpoint = 'movie/popular';
    }

    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, { params });
    
    // Берем нужное количество фильмов
    const movies = (response.data.results || []).slice(0, count);

    console.log(`✅ Got ${movies.length} ${recommendationType} recommendations`);

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
    
    if (!query) {
      console.log('❌ No query provided');
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Check if TMDB API key is configured
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      console.log('❌ TMDB API key not configured');
      return res.status(500).json({ error: 'TMDB API key not configured' });
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

