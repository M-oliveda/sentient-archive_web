import { createFileRoute } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ActivityPage } from "@/pages/dashboard/ActivityPage";

export const Route = createFileRoute("/activity")({
    component: ActivityRoute,
});

function ActivityRoute() {
    return (
        <ProtectedRoute>
            <NuqsAdapter>
                <DashboardLayout>
                    <ActivityPage />
                </DashboardLayout>
            </NuqsAdapter>
        </ProtectedRoute>
    );
}
