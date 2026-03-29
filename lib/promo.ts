import { RACE_INFO, PROMO_DISCOUNT } from '@/lib/constants';

// Comma-separated list of codes giving $3 off entry (e.g. "onceinabluemoon,oncen/abluemoon")
const DISCOUNT_CODES = (process.env.PROMO_CODES || '')
  .split(',')
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

// Code that makes entry fully free (shirt still charged if selected)
const FREE_CODE = (process.env.PROMO_CODE_FREE || '').trim().toUpperCase();

export function resolvePromo(code: string): { valid: boolean; discount: number; free: boolean } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, discount: 0, free: false };

  if (FREE_CODE && normalized === FREE_CODE) {
    return { valid: true, discount: RACE_INFO.price, free: true };
  }
  if (DISCOUNT_CODES.length > 0 && DISCOUNT_CODES.includes(normalized)) {
    return { valid: true, discount: PROMO_DISCOUNT, free: false };
  }
  return { valid: false, discount: 0, free: false };
}
