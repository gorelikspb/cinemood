const express = require('express');
const db = require('../database');

const router = express.Router();

// Add emotion to movie
router.post('/', (req, res) => {
  try {
    const { movie_id, emotion_type, intensity, description } = req.body;
    const userId = req.userId; // Извлекаем user_id из middleware

    if (!movie_id || !emotion_type || !intensity) {
      return res.status(400).json({ 
        error: 'movie_id, emotion_type, and intensity are required' 
      });
    }

    if (intensity < 1 || intensity > 10) {
      return res.status(400).json({ 
        error: 'Intensity must be between 1 and 10' 
      });
    }

    // Проверяем, что фильм принадлежит пользователю
    db.get('SELECT id FROM movies WHERE id = ? AND user_id = ?', [movie_id, userId], (err, movie) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to verify movie ownership' });
      }
      
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found or does not belong to you' });
      }

      const sql = `
        INSERT INTO emotions (user_id, movie_id, emotion_type, intensity, description)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(sql, [userId, movie_id, emotion_type, intensity, description], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to add emotion' });
        }

        res.json({ 
          id: this.lastID, 
          message: 'Emotion added successfully' 
        });
      });
    });
  } catch (error) {
    console.error('Add emotion error:', error);
    res.status(500).json({ error: 'Failed to add emotion' });
  }
});

// Get emotions for a movie
router.get('/movie/:movieId', (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.userId; // Извлекаем user_id из middleware

    const sql = `
      SELECT * FROM emotions 
      WHERE movie_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `;

    db.all(sql, [movieId, userId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch emotions' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get emotions error:', error);
    res.status(500).json({ error: 'Failed to fetch emotions' });
  }
});

// Get all emotions with movie details
router.get('/', (req, res) => {
  try {
    const { emotion_type, limit = 50 } = req.query;
    const userId = req.userId; // Извлекаем user_id из middleware

    let sql = `
      SELECT e.*, m.title, m.poster_path, m.watched_date
      FROM emotions e
      JOIN movies m ON e.movie_id = m.id
      WHERE e.user_id = ? AND m.user_id = ?
    `;
    
    const params = [userId, userId];
    
    if (emotion_type) {
      sql += ' AND e.emotion_type = ?';
      params.push(emotion_type);
    }
    
    sql += ' ORDER BY e.created_at DESC LIMIT ?';
    params.push(limit);

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch emotions' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get emotions error:', error);
    res.status(500).json({ error: 'Failed to fetch emotions' });
  }
});

// Update emotion
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { emotion_type, intensity, description } = req.body;
    const userId = req.userId; // Извлекаем user_id из middleware

    if (intensity && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({ 
        error: 'Intensity must be between 1 and 10' 
      });
    }

    const sql = `
      UPDATE emotions 
      SET emotion_type = ?, intensity = ?, description = ?
      WHERE id = ? AND user_id = ?
    `;

    db.run(sql, [emotion_type, intensity, description, id, userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update emotion' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Emotion not found' });
      }

      res.json({ message: 'Emotion updated successfully' });
    });
  } catch (error) {
    console.error('Update emotion error:', error);
    res.status(500).json({ error: 'Failed to update emotion' });
  }
});

// Delete all emotions for a movie (must be before /:id route)
router.delete('/movie/:movieId', (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.userId; // Извлекаем user_id из middleware

    // Проверяем, что фильм принадлежит пользователю
    db.get('SELECT id FROM movies WHERE id = ? AND user_id = ?', [movieId, userId], (err, movie) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to verify movie ownership' });
      }
      
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found or does not belong to you' });
      }

      const sql = 'DELETE FROM emotions WHERE movie_id = ? AND user_id = ?';

      db.run(sql, [movieId, userId], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete emotions' });
        }

        res.json({ 
          message: 'Emotions deleted successfully',
          deletedCount: this.changes
        });
      });
    });
  } catch (error) {
    console.error('Delete emotions error:', error);
    res.status(500).json({ error: 'Failed to delete emotions' });
  }
});

// Delete emotion
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Извлекаем user_id из middleware

    const sql = 'DELETE FROM emotions WHERE id = ? AND user_id = ?';

    db.run(sql, [id, userId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete emotion' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Emotion not found' });
      }

      res.json({ message: 'Emotion deleted successfully' });
    });
  } catch (error) {
    console.error('Delete emotion error:', error);
    res.status(500).json({ error: 'Failed to delete emotion' });
  }
});

// Get emotion statistics
router.get('/stats/overview', (req, res) => {
  try {
    const userId = req.userId; // Извлекаем user_id из middleware
    
    const sql = `
      SELECT 
        emotion_type,
        COUNT(*) as count,
        AVG(intensity) as avg_intensity,
        MAX(intensity) as max_intensity,
        MIN(intensity) as min_intensity
      FROM emotions 
      WHERE user_id = ?
      GROUP BY emotion_type
      ORDER BY count DESC
    `;

    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch emotion stats' });
      }

      res.json(rows);
    });
  } catch (error) {
    console.error('Get emotion stats error:', error);
    res.status(500).json({ error: 'Failed to fetch emotion stats' });
  }
});

module.exports = router;


