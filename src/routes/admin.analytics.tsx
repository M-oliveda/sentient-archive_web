import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminAnalyticsPage } from "@/pages/dashboard/AdminAnalyticsPage";

export const Route = createFileRoute("/admin/analytics")({
    component: () => (
        <ProtectedRoute requireAdmin>
            <DashboardLayout>
                <AdminAnalyticsPage />
            </DashboardLayout>
        </ProtectedRoute>
    ),
});
