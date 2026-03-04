-- ============================================
-- Blue Moon 5 Miler — Supabase Schema
-- (Payment Link version — no promo codes table)
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
  bib_number INTEGER UNIQUE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount_paid NUMERIC(10,2),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
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

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

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

-- Service role bypasses RLS (used by webhooks and admin API routes)