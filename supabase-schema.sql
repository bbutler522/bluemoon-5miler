-- ============================================
-- Blue Moon 5 Miler — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ----------------------------------------
-- Promo Codes
-- ----------------------------------------
create table public.promo_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null,
  max_uses integer,              -- null = unlimited
  current_uses integer default 0,
  is_active boolean default true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz default now()
);

-- Seed a couple of default promo codes
insert into public.promo_codes (code, discount_type, discount_value, max_uses) values
  ('EARLYBIRD', 'percentage', 20, 50),
  ('10OFF', 'fixed', 10, null);

-- ----------------------------------------
-- Registrations
-- ----------------------------------------
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  shirt_size text check (shirt_size in ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  promo_code_id uuid references public.promo_codes(id),
  amount_paid numeric(10, 2) default 0,
  bib_number integer unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookups
create index idx_registrations_user_id on public.registrations(user_id);
create index idx_registrations_email on public.registrations(email);
create index idx_registrations_payment_status on public.registrations(payment_status);

-- Auto-assign bib numbers
create or replace function public.assign_bib_number()
returns trigger as $$
begin
  if NEW.payment_status = 'completed' and NEW.bib_number is null then
    NEW.bib_number := (
      select coalesce(max(bib_number), 100) + 1
      from public.registrations
      where bib_number is not null
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_assign_bib
  before insert or update on public.registrations
  for each row execute function public.assign_bib_number();

-- Auto-update updated_at
create or replace function public.update_modified_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_updated_at
  before update on public.registrations
  for each row execute function public.update_modified_column();

-- ----------------------------------------
-- Row Level Security
-- ----------------------------------------
alter table public.registrations enable row level security;
alter table public.promo_codes enable row level security;

-- Users can read their own registrations
create policy "Users read own registrations"
  on public.registrations for select
  using (auth.uid() = user_id);

-- Users can insert their own registrations
create policy "Users insert own registrations"
  on public.registrations for insert
  with check (auth.uid() = user_id);

-- Promo codes are readable by everyone (needed for validation)
create policy "Anyone can read active promo codes"
  on public.promo_codes for select
  using (is_active = true);

-- Service role bypasses RLS for webhooks/admin operations
-- (No additional policy needed — service role key bypasses RLS by default)
