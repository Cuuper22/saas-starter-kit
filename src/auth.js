const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getDB } = require('./db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('./email');

const authRouter = express.Router();

// Password validation helper
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  return { valid: true };
}

authRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!email.includes('@')) return res.status(400).json({ error: 'Invalid email format' });

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

  const hash = await bcrypt.hash(password, 12);
  const apiKey = 'sk_' + crypto.randomBytes(24).toString('hex');

  try {
    const db = getDB();
    const result = db.prepare('INSERT INTO users (email, password_hash, name, api_key) VALUES (?, ?, ?, ?)').run(email, hash, name, apiKey);
    req.session.userId = result.lastInsertRowid;

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name }).catch(err => console.error('Email error:', err));

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

// Password reset: request token
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const db = getDB();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

  // Always return success to prevent email enumeration
  if (!user) return res.json({ success: true, message: 'If the email exists, a reset link was sent' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?').run(token, expires.toISOString(), user.id);

  sendPasswordResetEmail({ to: email, token }).catch(err => console.error('Email error:', err));

  res.json({ success: true, message: 'If the email exists, a reset link was sent' });
});

// Password reset: verify token and update password
authRouter.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

  const db = getDB();
  const user = db.prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?').get(token, new Date().toISOString());

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

  const hash = await bcrypt.hash(password, 12);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?').run(hash, user.id);

  res.json({ success: true, message: 'Password reset successfully' });
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
