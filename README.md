# SaaS Starter Kit

Production-ready Node.js SaaS boilerplate with Stripe subscriptions, authentication, email, and dashboard. Ship your SaaS in hours, not weeks.

## Features

- **Stripe Payments**: Full subscription flow with checkout, webhooks, and customer portal
- **Authentication**: Secure session-based auth with bcrypt + API key support
- **Email System**: Transactional emails via SMTP (Gmail, Outlook, etc.)
- **Dashboard**: Usage stats, API key management, billing
- **Security**: Helmet.js headers, rate limiting, secure sessions
- **Database**: SQLite with better-sqlite3 (easy deployment, no external DB)
- **Tests**: Jest test suite with 90%+ coverage

## Quick Start

```bash
# Clone and install
git clone https://github.com/Cuuper22/saas-starter-kit.git
cd saas-starter-kit
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Run
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Required:
```
SESSION_SECRET=<generate with: openssl rand -hex 32>
```

Optional (for full functionality):
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create account (email, password, name)
- `POST /auth/login` - Login (email, password)
- `POST /auth/logout` - Logout

### Dashboard
- `GET /dashboard` - Dashboard page (requires auth)
- `GET /api/dashboard` - Dashboard data (JSON)

### Payments
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/billing-portal` - Access Stripe customer portal
- `POST /webhook/stripe` - Stripe webhook handler

### Usage Tracking
- `POST /api/track` - Track API usage (example endpoint)

## API Authentication

Two methods:

1. **Session** (after login via web)
2. **API Key** (from dashboard)

```bash
# Using API key
curl -H "X-API-Key: sk_your_key_here" http://localhost:3000/api/dashboard
```

## Testing

```bash
npm test
```

Tests cover:
- Auth flow (signup, login, logout)
- Stripe integration (checkout, subscriptions)
- Email sending (with mocked SMTP)
- API endpoints and rate limiting

## Deployment

### Docker
```bash
docker build -t saas-app .
docker run -p 3000:3000 --env-file .env saas-app
```

### PM2
```bash
npm install -g pm2
pm2 start src/server.js --name saas
pm2 save
```

### Stripe Webhooks
Set up webhook endpoint: `https://yourdomain.com/webhook/stripe`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Database Schema

```sql
users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free',
  api_key TEXT UNIQUE,
  created_at DATETIME
)

usage (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  endpoint TEXT,
  timestamp DATETIME
)
```

## Security Best Practices

- Session secret is ENV-based (fails if not set)
- Passwords hashed with bcrypt (cost: 12)
- Helmet.js security headers enabled
- Rate limiting: 60 req/min per user
- HTTPS cookies in production
- SQL injection protected (prepared statements)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Payments**: Stripe
- **Email**: Nodemailer (SMTP)
- **Security**: Helmet, bcrypt
- **Tests**: Jest + Supertest

## License

MIT - See LICENSE file

## Support

Open an issue on GitHub or email support@yourdomain.com
