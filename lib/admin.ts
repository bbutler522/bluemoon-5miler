// Admin access control
// Add club organizer emails here — keeps it simple without extra DB tables
const ADMIN_EMAILS: string[] = [
  // Add your email(s) here (must match the email you use to sign in):
  'bbutler522@gmail.com',
  'jazzelinger@gmail.com',
];

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}

// Registration stats types
export interface RegistrationStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  revenue: number;
  averagePrice: number;
  shirtSizes: Record<string, number>;
  genderBreakdown: Record<string, number>;
  registrationsByDay: { date: string; count: number }[];
}

export interface AdminRegistration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  shirt_size: string | null;
  payment_status: string;
  amount_paid: number;
  bib_number: number | null;
  created_at: string;
  updated_at: string;
}
