const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const { initDB, getDB } = require('./db');
const { setupStripe, createCheckoutSession, handleWebhook, getSubscriptionStatus, createCustomerPortalSession } = require('./stripe');
const { setupEmail, sendWelcomeEmail } = require('./email');
const { authRouter, requireAuth } = require('./auth');
const { rateLimiter } = require('./middleware/rateLimit');
const { csrfProtection } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for simplicity
}));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// Session setup
if (!process.env.SESSION_SECRET) {
  console.error('❌ SESSION_SECRET not set — this is required for production!');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// Stripe webhook needs raw body
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = await handleWebhook(req.body, sig);
    
    const db = getDB();
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;
        db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, userId);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const sub = event.data.object;
        const plan = sub.items.data[0]?.price?.nickname || 'pro';
        db.prepare('UPDATE users SET plan = ? WHERE stripe_customer_id = ?').run(plan, sub.customer);
        break;
        
      case 'customer.subscription.deleted':
        db.prepare('UPDATE users SET plan = ? WHERE stripe_customer_id = ?').run('free', event.data.object.customer);
        break;
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// JSON parsing for other routes
app.use(express.json());

// CSRF protection (after session, before routes)
// Exempt Stripe webhook, API key auth, and test mode from CSRF
app.use((req, res, next) => {
  // Skip CSRF for test environment, Stripe webhooks, and API key authentication
  if (process.env.NODE_ENV === 'test' || req.path === '/webhook/stripe' || req.headers['x-api-key'] || req.query.api_key) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Provide CSRF token to frontend
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/auth', authRouter);
app.use('/api', rateLimiter, requireAuth);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Dashboard (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// API: Get dashboard data
app.get('/api/dashboard', requireAuth, async (req, res) => {
  const db = getDB();
  const userId = req.session.userId || req.userId;
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const usageCount = db.prepare('SELECT COUNT(*) as total FROM usage WHERE user_id = ? AND timestamp > datetime("now", "-30 days")').get(userId);
  const recentUsage = db.prepare('SELECT endpoint, timestamp FROM usage WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10').all(userId);
  
  res.json({
    email: user.email,
    name: user.name,
    plan: user.plan,
    apiKey: user.api_key,
    createdAt: user.created_at,
    usage: {
      total: usageCount.total,
      recent: recentUsage
    }
  });
});

// API: Create checkout session
app.post('/api/checkout', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.session.userId || req.userId;
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId);
    
    const session = await createCheckoutSession({
      userId,
      email: user.email,
      priceId: req.body.priceId
    });
    
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create billing portal session
app.post('/api/billing-portal', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.session.userId || req.userId;
    const user = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(userId);
    
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }
    
    const session = await createCustomerPortalSession(user.stripe_customer_id);
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Track usage (example endpoint)
app.post('/api/track', requireAuth, (req, res) => {
  const db = getDB();
  const userId = req.session.userId || req.userId;
  
  db.prepare('INSERT INTO usage (user_id, endpoint) VALUES (?, ?)').run(userId, req.body.endpoint || '/api/track');
  
  res.json({ success: true });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server (only if not being imported for testing)
async function start() {
  await initDB();
  setupStripe();
  setupEmail();
  app.listen(PORT, () => console.log(`✅ SaaS running on port ${PORT}`));
}

// Only start if not in test mode
if (process.env.NODE_ENV !== 'test') {
  start();
} else {
  // Initialize DB for tests but don't start server
  initDB();
}

module.exports = app;
