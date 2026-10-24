import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const isPublicRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/test') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Comprobar token JWT de NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'omnimarket-super-secret-evaluation-key-2026',
  });

  // Redirigir la raíz / a /dashboard si está autenticado, o a /login si no
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rutas privadas: /dashboard, /kanban, /orders
  const isPrivateRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/kanban') ||
    pathname.startsWith('/orders');

  if (isPrivateRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
