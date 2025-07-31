import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect specific routes that require authentication
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login and signup pages
     * - home page and public pages
     */
    '/dashboard/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/payment/:path*',
    '/account/:path*',
  ],
};
