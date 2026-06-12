import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const protectedPaths = ['/items', '/my-tent', '/budget', '/chat', '/duties', '/menu', '/summary', '/admin'];
const platformPaths = ['/platform'];
const authPaths = ['/login'];
const platformAuthPaths = ['/platform/login'];

function homeForRole(role?: string): string {
  return role === 'admin' ? '/admin' : '/items';
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isPlatform = platformPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPlatformAuth = platformAuthPaths.some((p) => pathname === p);
  const isAuthPage =
    authPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPlatform && !isPlatformAuth && !session.platformAdmin) {
    return NextResponse.redirect(new URL('/platform/login', request.url));
  }

  if (isPlatformAuth && session.platformAdmin) {
    return NextResponse.redirect(new URL('/platform', request.url));
  }

  if (isProtected && !session.isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session.isLoggedIn) {
    return NextResponse.redirect(new URL(homeForRole(session.user?.role), request.url));
  }

  if (pathname.startsWith('/admin') && session.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/items', request.url));
  }

  if (pathname.startsWith('/admin') && session.platformAdmin && !session.user) {
    return NextResponse.redirect(new URL('/platform', request.url));
  }

  if (!pathname.startsWith('/api') && !pathname.includes('.')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    '/items/:path*',
    '/my-tent/:path*',
    '/budget/:path*',
    '/chat/:path*',
    '/duties/:path*',
    '/menu/:path*',
    '/summary/:path*',
    '/admin/:path*',
    '/login',
    '/login/:path*',
    '/platform',
    '/platform/:path*',
  ],
};
