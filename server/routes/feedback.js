const express = require('express');
const db = require('../database');

const router = express.Router();

/**
 * 💬 Сохранить отзыв пользователя
 * POST /api/feedback
 * Body: { message: string, email?: string }
 */
router.post('/', (req, res) => {
  try {
    const { message, email } = req.body;

    console.log('💬 Feedback POST request received:', {
      messageLength: message?.length || 0,
      hasEmail: !!email,
      email: email || 'none'
    });

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('❌ Feedback validation failed: message is required');
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.trim().length > 2000) {
      console.log('❌ Feedback validation failed: message too long');
      return res.status(400).json({ error: 'Message is too long (max 2000 characters)' });
    }

    // Проверяем email, если он передан
    if (email && email.trim() && !email.includes('@')) {
      console.log('❌ Feedback validation failed: invalid email');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const sql = 'INSERT INTO feedback (message, email) VALUES (?, ?)';
    
    console.log('💾 Attempting to save feedback to database...');
    
    db.run(sql, [message.trim(), email && email.trim() ? email.trim() : null], function(err) {
      if (err) {
        console.error('❌ Database error saving feedback:', err);
        console.error('❌ Error details:', {
          message: err.message,
          code: err.code,
          errno: err.errno
        });
        return res.status(500).json({ error: 'Failed to save feedback' });
      }

      console.log(`✅ Feedback saved successfully: ID ${this.lastID}, email: ${email || 'none'}`);
      console.log(`💾 Last insert ID: ${this.lastID}, Changes: ${this.changes}`);
      
      res.json({ 
        message: 'Feedback saved successfully',
        id: this.lastID
      });
    });
  } catch (error) {
    console.error('❌ Save feedback error:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

/**
 * 📋 Получить все отзывы (для разработчика)
 * GET /api/feedback
 * Query params: 
 *   - format: 'json' | 'csv' (default: 'json')
 */
router.get('/', (req, res) => {
  try {
    const { format = 'json' } = req.query;

    console.log('📋 GET /api/feedback request received');

    const sql = 'SELECT id, message, email, created_at FROM feedback ORDER BY created_at DESC';

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('❌ Database error fetching feedback:', err);
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }

      console.log(`📋 Found ${rows.length} feedback entries in database`);

      if (format === 'csv') {
        // Простой CSV формат
        const csvHeader = 'id,message,email,created_at\n';
        const csvRows = rows.map(row => {
          const message = `"${(row.message || '').replace(/"/g, '""')}"`;
          const email = row.email ? `"${row.email}"` : '';
          return `${row.id},${message},${email},"${row.created_at}"`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="feedback.csv"');
        res.send('\ufeff' + csvHeader + csvRows); // BOM для правильного отображения кириллицы в Excel
      } else {
        // JSON формат (по умолчанию)
        res.json({
          count: rows.length,
          feedback: rows
        });
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;

