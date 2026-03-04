export interface Registration {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  shirt_size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  promo_code_id?: string;
  amount_paid: number;
  bib_number?: number;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface RaceInfo {
  name: string;
  date: string;
  time: string;
  distance: string;
  location: string;
  price: number;
  description: string;
}
