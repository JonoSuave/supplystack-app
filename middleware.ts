import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AuthObject } from '@clerk/nextjs/dist/types/server';

// Define public routes that don't require authentication
const publicRoutes = ["/", "/about", "/contact", "/search", "/api/(.*)", "/sign-in(.*)", "/sign-up(.*)"]; 

// Export the Clerk middleware with configuration
export default clerkMiddleware({
  afterAuth(auth: AuthObject, req: NextRequest) {
    // If the route is public, don't check authentication
    if (publicRoutes.some(pattern => {
      const regex = new RegExp(`^${pattern.replace(/\(.*\)/, '.*')}$`);
      return regex.test(req.nextUrl.pathname);
    })) {
      return NextResponse.next();
    }
    
    // If the user is not authenticated, redirect to sign-in
    if (!auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      // Add the current URL as a redirect URL after sign-in
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  },
  publicRoutes
});
 
export const config = {
  // Protects all routes, including api/trpc
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
