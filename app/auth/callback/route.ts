import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/dashboard';
  }
  return path;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectPath = safeRedirectPath(url.searchParams.get('redirect'));
  const dest = new URL(redirectPath, url.origin);

  if (!code) {
    dest.searchParams.set('auth_error', 'missing_code');
    return NextResponse.redirect(dest);
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    dest.searchParams.set('auth_error', 'exchange');
    return NextResponse.redirect(dest);
  }

  return NextResponse.redirect(dest);
}
