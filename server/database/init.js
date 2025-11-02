const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

// Use absolute path and ensure directory exists
const dbPath = path.join(__dirname, 'sidandtos.db');

// Ensure database directory exists with proper permissions
const dbDir = path.dirname(dbPath);
fs.ensureDirSync(dbDir);

// Create database with error handling
// Open in WAL mode for better concurrency and to avoid locking issues
console.log('📂 Opening database at:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    console.error('Database path:', dbPath);
    console.error('Full error:', err);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if the database file exists and is not locked');
    console.error('   2. If using OneDrive, the file might be syncing - try pausing OneDrive');
    console.error('   3. Check file permissions');
    console.error('   4. Try deleting the database file and let it recreate');
    process.exit(1);
  } else {
    console.log('✅ Database connection opened successfully');
  }
});

// Enable WAL mode for better concurrency (helps with OneDrive sync issues)
db.run('PRAGMA journal_mode = WAL;', (err) => {
  if (err) {
    console.warn('⚠️ Could not enable WAL mode (this is usually okay):', err.message);
  }
});

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Check if database is open
    if (!db) {
      return reject(new Error('Database connection not available'));
    }
    
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          username TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          reset_token TEXT,
          reset_token_expires DATETIME,
          otp_code TEXT,
          otp_expires DATETIME
        )
      `);

      // Files table
      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { initDatabase, db };
