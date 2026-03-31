import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dynamic Rate Limiting (Simulated without Redis for Zero-SaaS)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;
const ipRequests = new Map<string, { count: number; expires: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const now = Date.now();
  
  // 1. SIMPLE RATE LIMITING (Memory-based)
  const clientData = ipRequests.get(ip);
  if (clientData && now < clientData.expires) {
    if (clientData.count >= MAX_REQUESTS) {
      return new NextResponse("Too many requests", { status: 429 });
    }
    clientData.count++;
  } else {
    ipRequests.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW });
  }

  // 2. SECURITY HEADERS (OWASP/Security Best Practices)
  const response = NextResponse.next();
  
  // HSTS (HTTP Strict Transport Security)
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  
  // CSP (Content Security Policy) - Strict by default
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();
  
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), camera=(), microphone=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (maybe exclude some specific ones if needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
