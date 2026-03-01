# SaaS Starter Kit

Node.js SaaS boilerplate with Stripe subscriptions, session auth, email, and a dashboard. SQLite backend — no external DB needed.

## What's In Here

- **Auth**: Session-based with bcrypt (cost 12) + API key support + password reset flow
- **Stripe**: Checkout sessions, subscription webhooks, customer portal
- **Email**: Transactional emails via SMTP (welcome, password reset)
- **Dashboard**: Usage stats, API key display, billing management
- **Security**: Helmet headers, CSRF protection, rate limiting (60 req/min), input validation
- **Database**: SQLite via better-sqlite3 (WAL mode, prepared statements)

## Quick Start

```bash
npm install

# Required: generate a session secret
export SESSION_SECRET=$(openssl rand -hex 32)

# Optional: Stripe and email config
# export STRIPE_SECRET_KEY=sk_test_...
# export SMTP_HOST=smtp.gmail.com

npm run dev
# → http://localhost:3000
```

Pages: `/signup`, `/login`, `/dashboard`, `/forgot-password`, `/reset-password`

## API

```bash
# Sign up
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "mypassword", "name": "Test"}'

# Use the returned API key
curl -H "X-API-Key: sk_..." http://localhost:3000/api/dashboard
```

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Session | Logout |
| POST | `/auth/forgot-password` | No | Request reset token |
| POST | `/auth/reset-password` | No | Reset with token |
| GET | `/api/dashboard` | Yes | User data + usage stats |
| POST | `/api/checkout` | Yes | Create Stripe checkout |
| POST | `/api/billing-portal` | Yes | Stripe customer portal |
| POST | `/api/track` | Yes | Track API usage |
| POST | `/webhook/stripe` | Stripe sig | Webhook handler |

Auth = session cookie or `X-API-Key` header.

## Tests

```bash
npm test
# 12 tests — auth flow, Stripe integration, email, API endpoints
```

## Stack

Express.js, better-sqlite3, Stripe SDK, bcrypt, Helmet, Nodemailer, Jest + Supertest

## License

MIT
