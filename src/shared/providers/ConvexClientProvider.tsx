"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create client if URL is provided
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    // If Convex is not configured, just render children without the provider
    if (!convex) {
        return <>{children}</>;
    }

    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
