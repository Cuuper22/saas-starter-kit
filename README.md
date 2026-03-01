## Why

Every SaaS boilerplate I found required Postgres, Redis, and 47 environment variables before you could run `npm start`. That's not a starter kit. That's a deployment exercise.

This one needs one env var (`SESSION_SECRET`) and works immediately. SQLite with WAL mode handles the database — no container, no connection string, no migrations server. Stripe is optional: the app runs without it, checkout sessions appear when you add the key. Email is fire-and-forget: the welcome email sends in the background, and if SMTP isn't configured, the signup still works.

The auth layer does both session cookies (for browser users) and API keys (for programmatic access) through a single middleware. Bcrypt at cost 12 for passwords, `crypto.randomBytes` for API keys and reset tokens, anti-enumeration on the forgot-password endpoint. Helmet headers, CSRF protection, rate limiting at 60 requests per minute.

The point of a starter kit is to remove decisions, not add them. Auth, billing, email, dashboard — these four things are the same in every SaaS. They should be solved on day zero so you can spend day one on the thing that actually makes your product different.

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
