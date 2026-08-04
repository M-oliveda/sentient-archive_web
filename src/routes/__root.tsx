import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    useAuth();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Outlet />
            <Toaster richColors position="top-center" />
        </ThemeProvider>
    );
}
