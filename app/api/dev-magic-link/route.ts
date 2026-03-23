import { createAdminSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// DEV-ONLY: Generate a magic link token without sending an email.
// This route is completely disabled in production.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { email, redirect = '/dashboard' } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const supabase = createAdminSupabase();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `http://localhost:3000/auth/callback?redirect=${encodeURIComponent(redirect)}`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the action_link as-is — it points to Supabase's /auth/v1/verify endpoint
  // (which must stay on the Supabase domain). The redirect_to param inside the link
  // already points to localhost:3000, so after verification you land back locally.
  return NextResponse.json({ link: data.properties.action_link });
}
