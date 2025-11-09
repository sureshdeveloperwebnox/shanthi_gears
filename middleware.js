import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/login") || 
            req.nextUrl.pathname.startsWith("/signup") ||
            req.nextUrl.pathname.startsWith("/forgot-password") ||
            req.nextUrl.pathname.startsWith("/reset-password")) {
          return true;
        }
        
        // Check for next-auth.session-token cookie first
        const sessionToken = req.cookies.get("next-auth.session-token");
        if (sessionToken) {
          console.log("Middleware: Session token found, allowing access to", req.nextUrl.pathname);
          return true;
        }
        
        // If no session token cookie, check for token
        if (token) {
          console.log("Middleware: Token found, allowing access to", req.nextUrl.pathname);
          return true;
        }
        
        console.log("Middleware: No session token or token, blocking access to", req.nextUrl.pathname);
        return false;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
