const Database = require('better-sqlite3');
const path = require('path');

let db;

function initDB() {
  db = new Database(path.join(__dirname, '../data/app.db'));
  db.pragma('journal_mode = WAL');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      stripe_customer_id TEXT,
      plan TEXT DEFAULT 'free',
      api_key TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      endpoint TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

function getDB() { return db; }

module.exports = { initDB, getDB };
