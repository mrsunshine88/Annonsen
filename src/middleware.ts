import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Skapa rate limiter endast om miljövariablerna är definierade
// (förhindrar krasch innan användaren har konfigurerat Upstash)
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Begränsa till max 30 API-anrop per IP under 1 minut.
  // Detta stoppar spam-botar, mass-skrapare och chat-spam.
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  });
}

export async function middleware(request: NextRequest) {
  // Applicera rate limiting på skyddskänsliga /api/ rutter
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Vi undantar webhooks, cron jobs och navbar-polling från IP-begränsningar
    if (
      request.nextUrl.pathname.startsWith('/api/webhook') || 
      request.nextUrl.pathname.startsWith('/api/cron/') ||
      request.nextUrl.pathname === '/api/auth/status'
    ) {
       return NextResponse.next();
    }

    // Om rate limiting är aktiverat
    if (ratelimit) {
      // Försök hämta användarens IP (Vercel använder x-forwarded-for)
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      // Boten är för aggressiv -> Returnera HTTP 429 Too Many Requests
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests. Snälla vänta en minut innan du försöker igen." }), 
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Kör bara middleware för API-rutter (förutom auth/session som är statiska/next-internal)
  matcher: '/api/:path*',
};
