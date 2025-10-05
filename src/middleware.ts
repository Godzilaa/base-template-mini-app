import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/business', '/gigs'];
const publicRoutes = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For protected routes, we'll let the client-side handle authentication
  // since wallet authentication is client-side
  if (isProtectedRoute) {
    // Add a header to indicate this is a protected route
    const response = NextResponse.next();
    response.headers.set('x-protected-route', 'true');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};