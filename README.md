# 🌕 Blue Moon 5 Miler

**Commonwealth Running Club's inaugural 5-mile race under the Blue Moon.**
May 31, 2026 — Prospect Park, Brooklyn, NY

A full-stack race registration site built with Next.js, Supabase, and Stripe.

---

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Free (Vercel) |
| Auth + Database | Supabase (PostgreSQL) | Free tier |
| Payments | Stripe Checkout | 2.9% + $0.30 per txn |
| Hosting | Vercel | Free tier |

**Total fixed cost: $0/month** — you only pay Stripe's per-transaction fee.

---

## Features

- 🎨 Stunning dark celestial theme with animated starfield
- 🔐 Email/password auth via Supabase
- 💳 Stripe Checkout for secure payments
- 🏷️ Promo codes (percentage or fixed discount, usage limits, date ranges)
- 📊 User dashboard with registration status, bib number, race details
- 🎽 Auto-assigned bib numbers on payment confirmation
- 🔄 Stripe webhook for real-time payment status updates
- 📱 Fully responsive — mobile-first design
- ⚡ Server-side rendering + edge middleware

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd bluemoon-5miler
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase-schema.sql` — run it
3. Go to **Settings → API** and grab your:
   - Project URL
   - `anon` (public) key
   - `service_role` key

### 3. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your **test mode** keys from the Dashboard → Developers → API keys:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)
3. Set up the webhook (details in **Stripe Webhook Setup** below)

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_RACE_PRICE_CENTS=5000
```

### 5. Run

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Stripe Webhook Setup

The webhook is critical — it's how Stripe tells your app that a payment succeeded.

### Local Development (with Stripe CLI)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret (`whsec_...`) — put that in your `.env.local`.

### Production (Vercel)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
4. Copy the signing secret to your Vercel environment variables

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables → add all from .env.example
```

Or connect your GitHub repo to Vercel for auto-deploys on push.

---

## Managing Promo Codes

Promo codes are managed directly in Supabase. Go to **Table Editor → promo_codes**.

Two codes are seeded by default:
- `EARLYBIRD` — 20% off, limited to 50 uses
- `10OFF` — $10 off, unlimited uses

### Create a Custom Code

In Supabase SQL Editor:

```sql
insert into public.promo_codes (code, discount_type, discount_value, max_uses, valid_until)
values ('CWRC2026', 'percentage', 15, 100, '2026-05-30T23:59:59Z');
```

### Code Fields

| Field | Description |
|-------|------------|
| `code` | The code users enter (auto-uppercased) |
| `discount_type` | `percentage` or `fixed` |
| `discount_value` | Amount (e.g., 20 for 20% or $20) |
| `max_uses` | Max redemptions (null = unlimited) |
| `valid_from` / `valid_until` | Optional date range |
| `is_active` | Toggle on/off |

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── registration/route.ts    # Creates registration + Stripe session
│   │   ├── promo-codes/route.ts     # Validates promo codes
│   │   └── webhooks/stripe/route.ts # Stripe webhook handler
│   ├── auth/callback/route.ts       # Email confirmation callback
│   ├── dashboard/page.tsx           # User's registration dashboard
│   ├── login/page.tsx               # Auth page (login/signup)
│   ├── register/page.tsx            # Registration form
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── Countdown.tsx                # Race countdown timer
│   ├── Footer.tsx                   # Site footer
│   ├── Moon.tsx                     # Animated moon SVG
│   └── Navigation.tsx               # Nav with auth state
├── lib/
│   ├── constants.ts                 # Race info, config
│   ├── stripe.ts                    # Stripe server client
│   ├── supabase-browser.ts          # Supabase browser client
│   └── supabase-server.ts          # Supabase server + admin client
├── types/
│   └── index.ts                     # TypeScript types
├── middleware.ts                     # Auth middleware
├── supabase-schema.sql              # Database schema
└── .env.example                     # Environment variable template
```

---

## Next Steps / Ideas

- [ ] Admin dashboard for race directors (view all registrations, export CSV)
- [ ] Email confirmations via Resend or SendGrid
- [ ] Race results page (post-race)
- [ ] Strava integration for post-race sharing
- [ ] Waitlist mode (toggle registration on/off)
- [ ] Transfer registration to another runner
- [ ] Course map with elevation profile

---

## License

Private — Commonwealth Running Club.
