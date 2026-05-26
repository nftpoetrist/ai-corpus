import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Security headers on all responses
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.shelbynet.shelby.xyz https://fullnode.testnet.aptoslabs.com https://*.aptoslabs.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // CORS for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const origin = req.headers.get("origin") ?? "";

    if (req.method === "OPTIONS") {
      const preflight = new NextResponse(null, { status: 204 });
      if (ALLOWED_ORIGINS.includes(origin)) {
        preflight.headers.set("Access-Control-Allow-Origin", origin);
      }
      preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      preflight.headers.set("Access-Control-Allow-Credentials", "true");
      preflight.headers.set("Access-Control-Max-Age", "86400");
      return preflight;
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Vary", "Origin");
    }
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
