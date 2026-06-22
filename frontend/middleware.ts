import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route guard. The `mb_access` cookie is set on register/login (both mock and
// real-JWT modes), so the (app) group is protected and authenticated users are
// bounced away from /auth.
const PROTECTED = ["/dashboard", "/onboarding", "/foods", "/history", "/goal", "/settings", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("mb_access")?.value;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // Authenticated users shouldn't sit on /auth.
  if (pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Unauthenticated access to the guarded group → /auth.
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
