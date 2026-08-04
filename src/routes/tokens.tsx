import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TokensPage } from "@/pages/dashboard/TokensPage";

export const Route = createFileRoute("/tokens")({
    component: TokensRoute,
});

function TokensRoute() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <TokensPage />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
