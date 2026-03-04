import { RaceInfo } from '@/types';

export const RACE_INFO: RaceInfo = {
  name: 'Blue Moon 5 Miler',
  date: 'May 31, 2026',
  time: '7:30 PM',
  distance: '5 Miles',
  location: 'Prospect Park, Brooklyn, NY',
  price: 50,
  description:
    'Run under the full moon at Prospect Park. A rare Blue Moon lights the way for Commonwealth Running Club\'s inaugural 5-mile race through one of Brooklyn\'s most beautiful parks.',
};

export const RACE_DATE = new Date('2026-05-31T19:30:00-04:00');

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;
