import { RACE_INFO } from '@/lib/constants';
import { createAdminSupabase } from '@/lib/supabase-server';

type PromoRow = {
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  max_uses: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

export async function resolvePromo(
  code: string
): Promise<{ valid: boolean; discount: number; free: boolean }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, discount: 0, free: false };

  const admin = createAdminSupabase();

  const { data: promo, error: promoError } = await admin
    .from('promo_codes')
    .select('code, discount_type, discount_value, max_uses, is_active, valid_from, valid_until')
    .eq('code', normalized)
    .maybeSingle<PromoRow>();

  if (promoError || !promo || !promo.is_active) {
    return { valid: false, discount: 0, free: false };
  }

  const now = new Date();
  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return { valid: false, discount: 0, free: false };
  }
  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return { valid: false, discount: 0, free: false };
  }

  if (promo.max_uses !== null) {
    const { count, error: countError } = await admin
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('promo_code_used', normalized)
      .eq('payment_status', 'completed');

    if (countError || (count ?? 0) >= promo.max_uses) {
      return { valid: false, discount: 0, free: false };
    }
  }

  const rawDiscount =
    promo.discount_type === 'percentage'
      ? (RACE_INFO.price * Number(promo.discount_value || 0)) / 100
      : Number(promo.discount_value || 0);

  const discount = Math.max(0, Math.min(RACE_INFO.price, Number(rawDiscount.toFixed(2))));
  const free = discount >= RACE_INFO.price;

  return { valid: discount > 0, discount, free };
}
