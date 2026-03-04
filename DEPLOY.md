# 🚀 Deployment Guide — Blue Moon 5 Miler

Get the site live and shareable in about 15 minutes.
No Stripe needed yet — demo mode auto-confirms registrations.

---

## Step 1: Push to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "initial commit — Blue Moon 5 Miler"

# Create a repo on github.com (private is fine), then:
git remote add origin https://github.com/YOUR_USERNAME/bluemoon-5miler.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set up Supabase (free — 2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up / sign in
2. Click **New Project**
   - Name: `bluemoon`
   - Database password: pick something strong (save it, you won't need it in your app though)
   - Region: **US East** (closest to Brooklyn)
   - Click **Create new project** — wait ~1 minute for it to spin up

3. **Run the database schema:**
   - Go to **SQL Editor** (left sidebar)
   - Click **New query**
   - Paste the entire contents of `supabase-schema.sql`
   - Click **Run** (or Cmd+Enter)
   - You should see "Success. No rows returned" — that's correct

4. **Grab your keys:**
   - Go to **Settings → API** (left sidebar under the gear icon)
   - Copy these three values (you'll need them in Step 4):
     - **Project URL** → `https://xxxxx.supabase.co`
     - **anon / public** key → `eyJ...` (the shorter one)
     - **service_role** key → `eyJ...` (the longer one — keep this secret!)

5. **Enable email auth** (should be on by default):
   - Go to **Authentication → Providers**
   - Make sure **Email** is enabled
   - Optionally disable "Confirm email" under **Authentication → Settings**
     for easier testing (you can re-enable later)

---

## Step 3: Deploy to Vercel (free — 3 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New → Project**
3. Import your `bluemoon-5miler` repository
4. **Framework Preset** should auto-detect **Next.js** — leave defaults
5. **Don't deploy yet** — first add environment variables (next step)

---

## Step 4: Add Environment Variables in Vercel

In the Vercel project setup (or Settings → Environment Variables after deploy):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key from Supabase |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app-name.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_RACE_PRICE_CENTS` | `5000` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` |

**You do NOT need Stripe keys yet.** Demo mode bypasses Stripe entirely.

After adding all variables, click **Deploy**.

---

## Step 5: Update your base URL

After the first deploy, Vercel gives you a URL like `https://bluemoon-5miler.vercel.app`.

1. Go to Vercel → your project → **Settings → Environment Variables**
2. Update `NEXT_PUBLIC_BASE_URL` to your actual Vercel URL
3. **Redeploy**: Go to **Deployments** → click the `...` on the latest → **Redeploy**

---

## Step 6: Set yourself as admin

Edit `lib/admin.ts` and add your email to the allowlist:

```typescript
const ADMIN_EMAILS: string[] = [
  'your-email@example.com',
];
```

Commit and push — Vercel auto-deploys on push.

---

## Step 7: Configure Supabase auth redirect

For the login confirmation emails to work:

1. Go to **Supabase → Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://bluemoon-5miler.vercel.app`
3. Add to **Redirect URLs**: `https://bluemoon-5miler.vercel.app/**`

---

## ✅ You're live!

Your site is now at `https://your-app.vercel.app` with:
- Full landing page with countdown
- User signup / login
- Registration form (auto-confirms in demo mode)
- User dashboard showing registration status + bib number
- Admin dashboard at `/admin` (only for your email)
- A little "Demo Mode" badge in the corner

### Share it!
Send the URL to friends, club members, anyone. They can:
1. Create an account
2. Register for the race (no real payment)
3. See their dashboard with bib number and race day info

---

## When you're ready for real payments

1. Create a [Stripe account](https://stripe.com) and get your test keys
2. Add to Vercel env vars:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe webhook setup)
3. Change `NEXT_PUBLIC_DEMO_MODE` to `false` (or delete it)
4. Set up the Stripe webhook:
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
5. Redeploy

Test with Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC.

When you go fully live, swap test keys for live keys in Vercel.

---

## Custom domain (optional)

If you have a domain like `bluemoonrun.com`:

1. Vercel → Settings → Domains → Add `bluemoonrun.com`
2. Follow Vercel's DNS instructions (usually adding an A record or CNAME)
3. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
4. Update Supabase redirect URLs to include the custom domain

---

## Quick reference

| Service | Dashboard |
|---------|-----------|
| Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) |

| What | Where |
|------|-------|
| Landing page | `/` |
| Register | `/register` |
| User dashboard | `/dashboard` |
| Edit profile | `/dashboard/profile` |
| Admin dashboard | `/admin` |
| Admin registrations | `/admin/registrations` |
| Admin promo codes | `/admin/promo-codes` |
