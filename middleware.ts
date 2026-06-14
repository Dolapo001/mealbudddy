import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route-guard skeleton. The auth cookie is set once M4 wires real JWT;
// for now the (app) group is reachable so you can click through the flow.
const PROTECTED = ["/dashboard", "/onboarding", "/foods", "/history", "/goal", "/settings", "/profile"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("mb_access")?.value;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // Authenticated users shouldn't sit on /auth.
  if (pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Guard enforcement is enabled in M4 (kept open now to keep the flow clickable):
  // if (isProtected && !token) return NextResponse.redirect(new URL("/auth", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
