const express = require('express');
const db = require('../database');
const axios = require('axios');

const router = express.Router();

// Функция для отправки email в Google Sheets
async function sendToGoogleSheets(email) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️ GOOGLE_SHEETS_WEBHOOK_URL not configured, skipping webhook');
    return;
  }
  
  try {
    await axios.post(webhookUrl, {
      email: email,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000 // 5 секунд таймаут
    });
    console.log(`✅ Email sent to Google Sheets: ${email}`);
  } catch (error) {
    // Не блокируем сохранение если webhook не работает
    console.error(`⚠️ Failed to send to Google Sheets: ${error.message}`);
  }
}

/**
 * 📧 Сохранить email пользователя
 * POST /api/emails
 * Body: { email: string }
 */
router.post('/', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Проверяем, есть ли уже такой email
    const checkSql = 'SELECT id FROM emails WHERE email = ?';
    
    db.get(checkSql, [email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to check email' });
      }

      if (row) {
        // Email уже существует - просто обновляем updated_at
        const updateSql = 'UPDATE emails SET updated_at = CURRENT_TIMESTAMP WHERE email = ?';
        db.run(updateSql, [email], function(updateErr) {
          if (updateErr) {
            console.error('Database error:', updateErr);
            return res.status(500).json({ error: 'Failed to update email' });
          }
          console.log(`📧 Email already exists, updated timestamp: ${email}`);
          
          // Отправляем в Google Sheets (если настроено)
          sendToGoogleSheets(email).catch(() => {});
          
          res.json({ 
            message: 'Email already exists, timestamp updated',
            email: email,
            id: row.id
          });
        });
      } else {
        // Новый email - добавляем
        const insertSql = 'INSERT INTO emails (email) VALUES (?)';
        db.run(insertSql, [email], function(insertErr) {
          if (insertErr) {
            console.error('Database error:', insertErr);
            return res.status(500).json({ error: 'Failed to save email' });
          }
          console.log(`📧 New email saved: ${email} (ID: ${this.lastID})`);
          
          // Отправляем в Google Sheets (если настроено)
          sendToGoogleSheets(email).catch(() => {});
          
          res.json({ 
            message: 'Email saved successfully',
            email: email,
            id: this.lastID
          });
        });
      }
    });
  } catch (error) {
    console.error('Save email error:', error);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

/**
 * 📋 Получить все email'ы (для разработчика)
 * GET /api/emails
 * Query params: 
 *   - format: 'json' | 'csv' (default: 'json')
 * 
 * ⚠️ ЗАЩИТА: Требует Authorization header с токеном
 */
router.get('/', (req, res) => {
  try {
    // Проверка авторизации через переменную окружения
    const authToken = req.headers.authorization;
    const adminToken = process.env.ADMIN_TOKEN || 'change-me-in-production';
    
    if (!authToken || authToken !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }
    
    const { format = 'json' } = req.query;

    const sql = 'SELECT id, email, created_at, updated_at FROM emails ORDER BY created_at DESC';

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch emails' });
      }

      if (format === 'csv') {
        // Простой CSV формат
        const csvHeader = 'id,email,created_at,updated_at\n';
        const csvRows = rows.map(row => 
          `${row.id},${row.email},"${row.created_at}","${row.updated_at}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="emails.csv"');
        res.send(csvHeader + csvRows);
      } else {
        // JSON формат (по умолчанию)
        res.json({
          count: rows.length,
          emails: rows
        });
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

/**
 * 🔍 Проверить, сохранен ли email
 * GET /api/emails/check/:email
 */
router.get('/check/:email', (req, res) => {
  try {
    const { email } = req.params;

    const sql = 'SELECT id, created_at FROM emails WHERE email = ?';

    db.get(sql, [email], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to check email' });
      }

      if (row) {
        res.json({ exists: true, created_at: row.created_at });
      } else {
        res.json({ exists: false });
      }
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

module.exports = router;

