import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/notes")({
    component: NotesLayoutRoute,
});

function NotesLayoutRoute() {
    return (
        <ProtectedRoute>
            <NuqsAdapter>
                <DashboardLayout>
                    <Outlet />
                </DashboardLayout>
            </NuqsAdapter>
        </ProtectedRoute>
    );
}
