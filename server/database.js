const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Movies table
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER UNIQUE,
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emotions table
  db.run(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  db.run('CREATE INDEX IF NOT EXISTS idx_movies_watched_date ON movies(watched_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emotions_movie_id ON emotions(movie_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emotions_type ON emotions(emotion_type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_emails_email ON emails(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)');
});

module.exports = db;


