"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../providers/AuthProvider";
import { usePathname } from "next/navigation";
import MaintenancePage from "@/app/maintenance/page";

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
    const settings = useQuery(api.settings.get);
    const { isAdmin, isLoading: authLoading } = useAuth();
    const pathname = usePathname();

    // Do not block admin routes or the maintenance page itself
    const isAdminRoute = pathname.startsWith("/admin");
    const isLoginPage = pathname === "/login";
    const isMaintenancePage = pathname === "/maintenance";

    if (!settings) return <>{children}</>;

    const isMaintenanceOn = settings.businessConfig.maintenanceMode;

    if (isMaintenanceOn && !isAdmin && !isAdminRoute && !isLoginPage && !isMaintenancePage) {
        // If auth is still loading, wait a bit to avoid flashing the maintenance page to an admin
        if (authLoading) {
            return (
                <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        return <MaintenancePage />;
    }

    return <>{children}</>;
}
