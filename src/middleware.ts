import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware - all routes are public
export function middleware(request: NextRequest) {
    // Allow all requests to pass through
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|hero-card.png|og-image.png|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js)$).*)',
    ],
};
