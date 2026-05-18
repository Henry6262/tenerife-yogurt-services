# CLAUDE.md — Tenerife Services

> Read `~/Documents/Gazillion-dollars/AGENTS.md` first.

---

## What It Is

Multi-service booking & delivery platform for Tenerife. Supports:
- Service bookings (agent profiles, calendar scheduling)
- Product orders with delivery
- Subscription management
- Promo codes
- Admin dashboard (orders, calendar, deliveries, products, services, staff, promos, subscriptions, yogurt leads)
- AI chat assistant
- Yogurt storefront (cart, orders, subscriptions)

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| DB | Neon PostgreSQL + Prisma |
| Payments | Stripe |
| Email | Resend |
| Real-time | WebSockets (`ws`) |
| Deploy | Vercel |

## Project Structure

```
app/
  admin/          — Full admin dashboard
  agent/[slug]/   — Agent public profile
  ai/             — AI chat interface
  api/            — Route handlers (export-orders, validate-promo)
  book/           — Booking flow
  yogurt/         — Yogurt storefront (cart, orders, subscriptions)
components/       — UI primitives + feature components
lib/              — Utilities, Prisma client, helpers
prisma/           — Schema + seed
types/            — Shared TypeScript types
```

## Key Rules

- Neon serverless Postgres via `@neondatabase/serverless`
- Prisma generate runs on postinstall
- Seed script at `prisma/seed.ts`
- Uses `tsx` for running TS scripts

## Env Requirements

`DATABASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`

## Last Updated

2026-05-16
