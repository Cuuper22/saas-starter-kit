# SaaS Starter Kit ⚡

Ship your SaaS MVP in hours, not weeks. Production-ready Node.js boilerplate with Stripe, auth, email, and a dashboard — all wired up and ready to deploy.

## What's Included

- **Stripe Payments** — Subscriptions + one-time purchases, webhooks, customer portal
- **Email** — Transactional email via Brevo/SendGrid (welcome, reset, invoice)
- **Authentication** — Session-based auth with secure password hashing
- **Dashboard** — Usage tracking, billing management, account settings
- **Landing Page** — Pricing table, feature sections, responsive design
- **API** — Rate limiting, API key auth, usage metering
- **Deployment** — Docker config, Cloudflare tunnel setup, PM2 process management

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | SQLite (zero config) |
| Payments | Stripe |
| Email | Brevo / SendGrid |
| Styling | Tailwind CSS |
| Deployment | Docker + Cloudflare |

## Quick Start

```bash
git clone https://github.com/Cuuper22/saas-starter-kit.git
cd saas-starter-kit
npm install
cp .env.example .env
# Add your Stripe & email API keys to .env
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
├── src/
│   ├── server.js          # Express server + routes
│   ├── auth.js            # Authentication middleware
│   ├── stripe.js          # Stripe integration
│   ├── email.js           # Email sending
│   ├── db.js              # SQLite database
│   └── middleware/
│       ├── rateLimit.js   # API rate limiting
│       └── apiKey.js      # API key validation
├── public/
│   ├── index.html         # Landing page
│   ├── dashboard.html     # User dashboard
│   ├── pricing.html       # Pricing page
│   └── css/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
└── package.json
```

## Features

### Stripe Integration
- Subscription plans with usage-based billing
- One-time purchases
- Webhook handling for payment events
- Customer portal for self-serve billing

### Email System
- Welcome emails on signup
- Password reset flow
- Invoice receipts
- Custom transactional templates

### Dashboard
- Real-time usage statistics
- API key management
- Billing history
- Account settings

## Deployment

### Option 1: Docker
```bash
docker compose up -d
```

### Option 2: PM2
```bash
pm2 start src/server.js --name my-saas
```

### Option 3: Cloudflare Tunnel
```bash
cloudflared tunnel run my-saas
```

## Full Version

This repo contains the core structure and landing page. 

**[Get the full kit ($49)](https://buy.stripe.com/6oU5kD4U7amuggC05s7Zu0a)** — includes all source code, Stripe integration, email system, auth, dashboard, Docker config, and deployment guides.

## Also Available

- **[Screenshot API](https://bennycutools.com/products.html)** — $9/mo
- **[Web Scraping API](https://bennycutools.com/products.html)** — $19/mo  
- **[Rush Web Development](https://bennycutools.com/products.html)** — $199, 48hr delivery

## License

MIT — use it however you want.

---

Built by [@Cuuper22](https://github.com/Cuuper22) | [bennycutools.com](https://bennycutools.com)
