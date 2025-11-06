const express = require('express');
const db = require('../database');

const router = express.Router();

// Get overall statistics
router.get('/overview', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      SELECT 
        COUNT(*) as total_movies,
        AVG(user_rating) as avg_user_rating,
        COUNT(DISTINCT DATE(watched_date)) as unique_watch_days,
        MIN(watched_date) as first_watch,
        MAX(watched_date) as last_watch
      FROM movies
      WHERE user_id = ?
    `;

    db.get(sql, [userId], (err, movieStats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch movie stats' });
      }

      // Get emotion stats
      const emotionSql = `
        SELECT 
          COUNT(*) as total_emotions,
          COUNT(DISTINCT emotion_type) as unique_emotions,
          AVG(intensity) as avg_intensity
        FROM emotions
        WHERE user_id = ?
      `;

      db.get(emotionSql, [userId], (err, emotionStats) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch emotion stats' });
        }

        res.json({
          movies: movieStats,
          emotions: emotionStats
        });
      });
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

// Get monthly statistics
router.get('/monthly', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      SELECT 
        strftime('%Y-%m', watched_date) as month,
        COUNT(*) as movies_watched,
        AVG(user_rating) as avg_rating,
        COUNT(DISTINCT DATE(watched_date)) as watch_days
      FROM movies 
      WHERE user_id = ? AND watched_date IS NOT NULL
      GROUP BY strftime('%Y-%m', watched_date)
      ORDER BY month DESC
      LIMIT 12
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch monthly stats' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

// Get genre statistics
router.get('/genres', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      SELECT 
        json_extract(genres.value, '$.name') as genre_name,
        COUNT(*) as count,
        AVG(m.user_rating) as avg_rating
      FROM movies m,
      json_each(m.genres) as genres
      WHERE m.user_id = ? AND m.genres IS NOT NULL AND m.genres != '[]'
      GROUP BY json_extract(genres.value, '$.name')
      ORDER BY count DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch genre stats' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get genre stats error:', error);
    res.status(500).json({ error: 'Failed to fetch genre stats' });
  }
});

// Get emotion trends over time
router.get('/emotion-trends', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      SELECT 
        strftime('%Y-%m', m.watched_date) as month,
        e.emotion_type,
        COUNT(*) as count,
        AVG(e.intensity) as avg_intensity
      FROM emotions e
      JOIN movies m ON e.movie_id = m.id
      WHERE e.user_id = ? AND m.user_id = ? AND m.watched_date IS NOT NULL
      GROUP BY strftime('%Y-%m', m.watched_date), e.emotion_type
      ORDER BY month DESC, count DESC
    `;

    db.all(sql, [userId, userId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch emotion trends' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get emotion trends error:', error);
    res.status(500).json({ error: 'Failed to fetch emotion trends' });
  }
});

// Get top movies by emotion intensity
router.get('/top-emotional', (req, res) => {
  try {
    const { emotion_type, limit = 10 } = req.query;
    const userId = req.userId; // Извлекаем user_id из middleware

    let sql = `
      SELECT 
        m.id,
        m.title,
        m.poster_path,
        m.watched_date,
        e.emotion_type,
        AVG(e.intensity) as avg_intensity,
        COUNT(e.id) as emotion_count
      FROM movies m
      JOIN emotions e ON m.id = e.movie_id
      WHERE e.user_id = ? AND m.user_id = ?
    `;

    const params = [userId, userId];

    if (emotion_type) {
      sql += ' AND e.emotion_type = ?';
      params.push(emotion_type);
    }

    sql += `
      GROUP BY m.id, e.emotion_type
      ORDER BY avg_intensity DESC, emotion_count DESC
      LIMIT ?
    `;
    params.push(limit);

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch top emotional movies' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get top emotional movies error:', error);
    res.status(500).json({ error: 'Failed to fetch top emotional movies' });
  }
});

// Get watch streak
router.get('/streak', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      WITH watch_dates AS (
        SELECT DISTINCT DATE(watched_date) as watch_date
        FROM movies 
        WHERE user_id = ? AND watched_date IS NOT NULL
        ORDER BY watch_date DESC
      ),
      date_gaps AS (
        SELECT 
          watch_date,
          LAG(watch_date) OVER (ORDER BY watch_date DESC) as prev_date,
          julianday(watch_date) - julianday(LAG(watch_date) OVER (ORDER BY watch_date DESC)) as gap_days
        FROM watch_dates
      )
      SELECT 
        COUNT(*) as current_streak,
        MIN(watch_date) as streak_start,
        MAX(watch_date) as streak_end
      FROM date_gaps
      WHERE gap_days <= 1 OR gap_days IS NULL
      AND watch_date >= date('now', '-30 days')
    `;

    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch streak data' });
      }

      res.json(row || { current_streak: 0, streak_start: null, streak_end: null });
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to fetch streak data' });
  }
});

module.exports = router;


