const express = require('express');
const db = require('../database');

const router = express.Router();

// Add emotion to movie
router.post('/', (req, res) => {
  try {
    const { movie_id, emotion_type, intensity, description } = req.body;

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

    const sql = `
      INSERT INTO emotions (movie_id, emotion_type, intensity, description)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [movie_id, emotion_type, intensity, description], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to add emotion' });
      }

      res.json({ 
        id: this.lastID, 
        message: 'Emotion added successfully' 
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

    const sql = `
      SELECT * FROM emotions 
      WHERE movie_id = ? 
      ORDER BY created_at DESC
    `;

    db.all(sql, [movieId], (err, rows) => {
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

    let sql = `
      SELECT e.*, m.title, m.poster_path, m.watched_date
      FROM emotions e
      JOIN movies m ON e.movie_id = m.id
    `;
    
    const params = [];
    
    if (emotion_type) {
      sql += ' WHERE e.emotion_type = ?';
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

    if (intensity && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({ 
        error: 'Intensity must be between 1 and 10' 
      });
    }

    const sql = `
      UPDATE emotions 
      SET emotion_type = ?, intensity = ?, description = ?
      WHERE id = ?
    `;

    db.run(sql, [emotion_type, intensity, description, id], function(err) {
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

    const sql = 'DELETE FROM emotions WHERE movie_id = ?';

    db.run(sql, [movieId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete emotions' });
      }

      res.json({ 
        message: 'Emotions deleted successfully',
        deletedCount: this.changes
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

    const sql = 'DELETE FROM emotions WHERE id = ?';

    db.run(sql, [id], function(err) {
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
    const sql = `
      SELECT 
        emotion_type,
        COUNT(*) as count,
        AVG(intensity) as avg_intensity,
        MAX(intensity) as max_intensity,
        MIN(intensity) as min_intensity
      FROM emotions 
      GROUP BY emotion_type
      ORDER BY count DESC
    `;

    db.all(sql, [], (err, rows) => {
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


