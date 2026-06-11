import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const protectedPaths = ['/items', '/my-tent', '/budget', '/chat', '/duties', '/menu', '/admin'];
const authPaths = ['/login'];

function homeForRole(role?: string): string {
  return role === 'admin' ? '/admin' : '/items';
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage =
    authPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

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
    '/admin/:path*',
    '/login',
    '/login/:path*',
  ],
};
