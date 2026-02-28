# saas-starter-kit

SaaS boilerplate. Node.js backend, Stripe for payments, authentication, email workflows, and an admin dashboard.

This is a starting point, not a finished product. Fork it, rip out what you don't need, build on what you do.

## What's Included

- **Auth**: Email/password signup, login, password reset
- **Payments**: Stripe integration with subscription management
- **Email**: Transactional email workflows (welcome, password reset, notifications)
- **Admin Dashboard**: User management, basic analytics
- **API**: RESTful endpoints with middleware

## Stack

- Node.js / Express
- Stripe SDK
- PostgreSQL
- JWT authentication
- Handlebars email templates

## Getting Started

```bash
git clone https://github.com/Cuuper22/saas-starter-kit.git
cd saas-starter-kit
npm install
cp .env.example .env    # fill in your keys
npm run dev
```

You'll need a Stripe account and a PostgreSQL database.

## License

MIT
