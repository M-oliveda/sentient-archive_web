import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({
    component: DashboardPage,
});

function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="bg-background flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome to your SentientArchive dashboard
                    </p>
                    <p className="text-muted-foreground mt-4 text-sm">
                        Phase 3: Dashboard Layout will be implemented next
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
