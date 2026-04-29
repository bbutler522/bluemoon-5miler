-- ============================================
-- Blue Moon 5 Miler — Supabase Schema
-- ============================================

-- Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  shirt_size TEXT,
  shirt_preorder BOOLEAN DEFAULT FALSE,
  waitlisted BOOLEAN DEFAULT FALSE,
  promo_code_used TEXT,
  referred_by TEXT,
  run_club TEXT,
  bib_number INTEGER UNIQUE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount_paid NUMERIC(10,2),
  stripe_checkout_session_id TEXT,
  stripe_checkout_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  payment_last_event TEXT,
  payment_last_event_at TIMESTAMP WITH TIME ZONE,
  payment_error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_checkout_session ON registrations(stripe_checkout_session_id);
CREATE INDEX idx_registrations_stripe_pi ON registrations(stripe_payment_intent_id);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Promo codes table (admin-managed)
CREATE TABLE promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_promo_codes_code_upper ON promo_codes (upper(code));
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Users can read their own registrations
CREATE POLICY "Users can view own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own registrations
CREATE POLICY "Users can create own registrations"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending registrations
CREATE POLICY "Users can update own pending registrations"
  ON registrations FOR UPDATE
  USING (auth.uid() = user_id AND payment_status = 'pending');

-- Users can view promo codes (actual enforcement happens in server routes)
CREATE POLICY "Authenticated users can view promo codes"
  ON promo_codes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role bypasses RLS (used by webhooks and admin API routes)

-- ============================================
-- Migrations (run these if the table already exists):
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS shirt_preorder BOOLEAN DEFAULT FALSE;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS waitlisted BOOLEAN DEFAULT FALSE;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS promo_code_used TEXT;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS referred_by TEXT;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS run_club TEXT;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS stripe_checkout_expires_at TIMESTAMP WITH TIME ZONE;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_last_event TEXT;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_last_event_at TIMESTAMP WITH TIME ZONE;
--   ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_error_message TEXT;
--   CREATE INDEX IF NOT EXISTS idx_registrations_checkout_session ON registrations(stripe_checkout_session_id);
--   CREATE TABLE IF NOT EXISTS promo_codes (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     code TEXT NOT NULL,
--     discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
--     discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
--     max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
--     is_active BOOLEAN DEFAULT TRUE,
--     valid_from TIMESTAMP WITH TIME ZONE,
--     valid_until TIMESTAMP WITH TIME ZONE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
--   );
--   CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_codes_code_upper ON promo_codes (upper(code));
-- ============================================