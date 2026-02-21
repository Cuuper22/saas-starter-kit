const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getDB } = require('./db');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const hash = await bcrypt.hash(password, 12);
  const apiKey = 'sk_' + crypto.randomBytes(24).toString('hex');
  
  try {
    const db = getDB();
    const result = db.prepare('INSERT INTO users (email, password_hash, name, api_key) VALUES (?, ?, ?, ?)').run(email, hash, name, apiKey);
    req.session.userId = result.lastInsertRowid;
    res.json({ success: true, apiKey });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  res.json({ success: true });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

function requireAuth(req, res, next) {
  // Check session or API key
  if (req.session?.userId) return next();
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (apiKey) {
    const db = getDB();
    const user = db.prepare('SELECT id FROM users WHERE api_key = ?').get(apiKey);
    if (user) { req.userId = user.id; return next(); }
  }
  res.status(401).json({ error: 'Authentication required' });
}

module.exports = { authRouter, requireAuth };
