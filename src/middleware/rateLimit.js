const limits = new Map();

function rateLimiter(req, res, next) {
  const key = req.userId || req.ip;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = 60;
  
  if (!limits.has(key)) limits.set(key, []);
  const hits = limits.get(key).filter(t => t > now - window);
  hits.push(now);
  limits.set(key, hits);
  
  if (hits.length > maxRequests) {
    return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: Math.ceil(window / 1000) });
  }
  
  res.setHeader('X-RateLimit-Remaining', maxRequests - hits.length);
  next();
}

module.exports = { rateLimiter };
