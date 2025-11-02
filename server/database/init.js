const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

const dbPath = path.join(__dirname, 'sidandtos.db');

// Ensure database directory exists
fs.ensureDirSync(path.dirname(dbPath));

const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
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
