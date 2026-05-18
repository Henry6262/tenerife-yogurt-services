# Tenerife Services

> Multi-service booking, delivery, and subscription platform for Tenerife.

## Features

- **Service Bookings** — Browse agents, view availability, book time slots
- **Product Orders** — Shop with delivery + Stripe checkout
- **Subscriptions** — Recurring service plans
- **Promo Codes** — Discount validation at checkout
- **Admin Dashboard** — Manage orders, calendar, deliveries, products, services, staff, promos, leads
- **AI Assistant** — Built-in chat interface
- **Yogurt Storefront** — Dedicated cart, orders, and subscription flow

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up env
cp .env.example .env
# Fill in DATABASE_URL (Neon), Stripe keys, Resend API key

# 3. Push schema + seed
npx prisma db push
npm run db:seed

# 4. Dev server
npm run dev

# 5. Prisma Studio (DB GUI)
npm run db:studio
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Database | Neon PostgreSQL + Prisma |
| Payments | Stripe |
| Email | Resend |
| Real-time | WebSockets |
| Deploy | Vercel |

## Project Structure

```
app/         — Next.js App Router (booking, admin, API, yogurt storefront)
components/  — Reusable UI components
lib/         — Utilities, DB client, helpers
prisma/      — Database schema + seed script
types/       — Shared TypeScript types
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + build |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed starter data |
| `npm run db:studio` | Open Prisma Studio |

## Status

Active development. See `CLAUDE.md` for agent context.
