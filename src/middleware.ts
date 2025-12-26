import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/about',
    '/services(.*)',
    '/portfolio(.*)',
    '/blog(.*)',
    '/store(.*)',
    '/contact',
    '/legal(.*)',
    '/auth(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/manifest.json',
    '/robots.txt',
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Explicitly exclude manifest.json and robots.txt from middleware
        '/((?!manifest.json|robots.txt).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
