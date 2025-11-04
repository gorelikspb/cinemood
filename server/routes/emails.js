const express = require('express');
const db = require('../database');
const axios = require('axios');

const router = express.Router();

// Функция для отправки email в Google Sheets с аналитикой
async function sendToGoogleSheets(email, analytics = {}) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  console.log('🔍 sendToGoogleSheets called:', {
    email: email,
    webhookUrlExists: !!webhookUrl,
    webhookUrlLength: webhookUrl ? webhookUrl.length : 0,
    webhookUrlPreview: webhookUrl ? webhookUrl.substring(0, 50) + '...' : 'NOT SET'
  });
  
  if (!webhookUrl) {
    console.log('⚠️ GOOGLE_SHEETS_WEBHOOK_URL not configured, skipping webhook');
    console.log('🔍 Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('SHEET')));
    return;
  }
  
  console.log('📤 Sending email to Google Sheets:', {
    email: email,
    webhookUrl: webhookUrl.substring(0, 50) + '...', // Показываем только начало URL
    source: analytics.source || 'unknown'
  });
  
  try {
    const payload = {
      email: email,
      timestamp: new Date().toISOString(),
      source: analytics.source || 'unknown',
      userAgent: analytics.userAgent || '',
      referrer: analytics.referrer || '',
      language: analytics.language || 'en',
      screenWidth: analytics.screenWidth || '',
      screenHeight: analytics.screenHeight || '',
      deviceType: analytics.deviceType || 'desktop',
      browser: analytics.browser || '',
      os: analytics.os || ''
    };
    
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000, // Увеличиваем таймаут до 10 секунд
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Email sent to Google Sheets successfully: ${email}`);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
  } catch (error) {
    // Не блокируем сохранение если webhook не работает
    console.error(`❌ Failed to send to Google Sheets: ${error.message}`);
    if (error.response) {
      console.error('📥 Response status:', error.response.status);
      console.error('📥 Response data:', error.response.data);
    }
    if (error.request) {
      console.error('📤 Request was made but no response received');
    }
  }
}

/**
 * 📧 Сохранить email пользователя
 * POST /api/emails
 * Body: { 
 *   email: string,
 *   source?: string,      // Dashboard, Watchlist, EmailModal
 *   userAgent?: string,   // Браузер и устройство
 *   referrer?: string,     // Откуда пришел
 *   language?: string,     // Язык интерфейса
 *   screenWidth?: number,  // Ширина экрана
 *   screenHeight?: number, // Высота экрана
 *   deviceType?: string,  // mobile, tablet, desktop
 *   browser?: string,      // Chrome, Firefox, Safari
 *   os?: string           // Windows, Mac, iOS, Android
 * }
 */
router.post('/', (req, res) => {
  try {
    const { 
      email, 
      source, 
      userAgent, 
      referrer, 
      language,
      screenWidth,
      screenHeight,
      deviceType,
      browser,
      os
    } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Собираем аналитику
    const analytics = {
      source: source || 'unknown',
      userAgent: userAgent || req.headers['user-agent'] || '',
      referrer: referrer || req.headers.referer || '',
      language: language || 'en',
      screenWidth: screenWidth || '',
      screenHeight: screenHeight || '',
      deviceType: deviceType || 'desktop',
      browser: browser || '',
      os: os || ''
    };

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
          
          // Отправляем в Google Sheets с аналитикой (если настроено)
          console.log('📤 About to call sendToGoogleSheets for existing email');
          sendToGoogleSheets(email, analytics).catch((err) => {
            console.error('❌ Error in sendToGoogleSheets callback:', err);
          });
          
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
          
          // Отправляем в Google Sheets с аналитикой (если настроено)
          console.log('📤 About to call sendToGoogleSheets for new email');
          sendToGoogleSheets(email, analytics).catch((err) => {
            console.error('❌ Error in sendToGoogleSheets callback:', err);
          });
          
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

