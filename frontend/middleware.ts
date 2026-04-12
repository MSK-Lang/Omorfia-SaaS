import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Capture the secret bypass cookie we set in the Gatekeeper
  const devSessionCookie = request.cookies.get('omorfia_dev_session');
  const isDevBypassActive = devSessionCookie?.value === 'true';

  // Safely initialize the Supabase SSR client for middleware routing checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Retrieve the actual active Supabase session
  const { data: { session } } = await supabase.auth.getSession();

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/passport');

  if (isProtectedRoute && !session) {
    // Check if the developer bypass is active before throwing out to login
    if (isDevBypassActive) {
       console.log('Middleware: Dev Gatekeeper session approved. Bypassing Supabase Auth.');
       return response;
    }
    
    // Normal routing: unauthorized user attempting to access a secure app path
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // If they have a valid Supabase session, or they are on a public route, proceed normally.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (we handle API routes differently)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
