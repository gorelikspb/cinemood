const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use persistent volume if available, otherwise use local directory
// Railway Persistent Volume should be mounted at /data
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

// Проверяем существование директории
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('📁 Database path:', dbPath);
console.log('📁 Database directory exists:', fs.existsSync(dbDir));
console.log('📁 Database file exists:', fs.existsSync(dbPath));
console.log('📁 DATABASE_PATH env:', process.env.DATABASE_PATH || 'not set (using default)');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
  } else {
    console.log('✅ Database connection opened successfully');
  }
});

// Initialize database tables
db.serialize(() => {
  // Movies table
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      tmdb_id INTEGER,
      title TEXT NOT NULL,
      overview TEXT,
      release_date TEXT,
      poster_path TEXT,
      backdrop_path TEXT,
      genres TEXT,
      rating REAL,
      runtime INTEGER,
      watched_date TEXT NOT NULL,
      user_rating INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, tmdb_id)
    )
  `);

  // Emotions table
  db.run(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id INTEGER,
      emotion_type TEXT NOT NULL,
      intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
    )
  `);

  // Movie genres junction table
  db.run(`
    CREATE TABLE IF NOT EXISTS movie_genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER,
      genre_name TEXT NOT NULL,
      FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
    )
  `);

  // Emails table (for collecting user emails)
  db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Feedback table (for user feedback)
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.run('CREATE INDEX IF NOT EXISTS idx_movies_user_id ON movies(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_movies_watched_date ON movies(watched_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emotions_user_id ON emotions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emotions_movie_id ON emotions(movie_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emotions_type ON emotions(emotion_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)');
  
  // Migration: Add user_id column to existing tables if they don't have it
  // SQLite doesn't support adding NOT NULL columns to existing tables, so we add without NOT NULL
  // then update all existing records, ensuring no NULL values remain
  db.run(`ALTER TABLE movies ADD COLUMN user_id TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Migration error (movies.user_id):', err.message);
    } else {
      // Update existing records without user_id to have a default 'anonymous' user_id
      // This ensures backward compatibility
      db.run(`UPDATE movies SET user_id = 'anonymous' WHERE user_id IS NULL`, (err) => {
        if (err) {
          console.error('Migration error (update movies):', err.message);
        } else {
          console.log('✅ Migrated existing movies to anonymous user');
        }
      });
    }
  });
  
  db.run(`ALTER TABLE emotions ADD COLUMN user_id TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Migration error (emotions.user_id):', err.message);
    } else {
      // Update existing records without user_id to have a default 'anonymous' user_id
      db.run(`UPDATE emotions SET user_id = 'anonymous' WHERE user_id IS NULL`, (err) => {
        if (err) {
          console.error('Migration error (update emotions):', err.message);
        } else {
          console.log('✅ Migrated existing emotions to anonymous user');
        }
      });
    }
  });
});

module.exports = db;


