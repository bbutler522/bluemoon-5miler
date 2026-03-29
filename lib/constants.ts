import { RaceInfo } from '@/types';

export const RACE_INFO: RaceInfo = {
  name: 'Blue Moon 5 Miler',
  date: 'Sunday, May 31st',
  time: '8:00 PM Start',
  distance: '5 Miles',
  location: 'Prospect Park, Brooklyn, NY',
  price: 18,
  description:
    'A blue moon only comes around once every three years. We’re running it. Join us for a 5-mile night race in Prospect Park. No frills—just a solid course, good people, and a reason to get out there.',
};

export const RACE_DATE = new Date('2026-05-31T20:00:00-04:00');

// Race capacity — once this many paid registrations exist, new signups go to waitlist
export const RACE_CAPACITY = 200;

// Add-ons
export const SHIRT_PREORDER_PRICE = 22;

// Promo code discount — $3 off standard entry ($18 → $15).
// The actual promo code string lives in PROMO_CODE env var (server-side only).
export const PROMO_DISCOUNT = 3;

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;
