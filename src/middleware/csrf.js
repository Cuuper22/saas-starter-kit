const crypto = require('crypto');

// Simple CSRF protection middleware
function csrfProtection(req, res, next) {
  // Generate CSRF token for session if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Provide method to get token
  req.csrfToken = () => req.session.csrfToken;

  // For GET, HEAD, OPTIONS - just pass through
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // For state-changing methods, verify token
  const token = req.headers['csrf-token'] || req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;

  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

module.exports = { csrfProtection };
