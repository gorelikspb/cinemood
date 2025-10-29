const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

// Delete existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Old database deleted');
}

const db = new sqlite3.Database(dbPath);

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

  console.log('✅ Database reset successfully');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Database connection closed');
    process.exit(0);
  }
});

