const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDB } = require('./db');
const { setupStripe } = require('./stripe');
const { setupEmail } = require('./email');
const { authRouter, requireAuth } = require('./auth');
const { rateLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Routes
app.use('/auth', authRouter);
app.use('/api', rateLimiter, requireAuth);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Dashboard (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Stripe webhook (raw body needed)
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  // Handle Stripe webhooks
  res.json({ received: true });
});

// Start
async function start() {
  await initDB();
  setupStripe();
  setupEmail();
  app.listen(PORT, () => console.log(`SaaS running on port ${PORT}`));
}

start();
