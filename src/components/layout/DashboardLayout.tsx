import {
    BarChart3,
    Bot,
    Clock,
    Coins,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar, type INavItem } from "./DashboardSidebar";

interface IDashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: IDashboardLayoutProps) {
    const { t } = useTranslation("layout");
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";

    const CLIENT_NAV_ITEMS: INavItem[] = [
        { label: t("dashboard"), icon: LayoutDashboard, to: "/dashboard" },
        { label: t("notes"), icon: FileText, to: "/notes" },
        { label: t("aiFeatures"), icon: Bot, to: "/ai-features" },
        { label: t("tokens"), icon: Coins, to: "/tokens" },
        { label: t("activity"), icon: Clock, to: "/activity" },
        { label: t("settings"), icon: Settings, to: "/settings" },
    ];

    const ADMIN_NAV_ITEMS: INavItem[] = [
        { label: t("dashboard"), icon: LayoutDashboard, to: "/dashboard" },
        { label: t("analytics"), icon: BarChart3, to: "/admin/analytics" },
        { label: t("activityLogs"), icon: Clock, to: "/admin/activity-logs" },
        { label: t("users"), icon: Users, to: "/admin/users" },
        { label: t("tokenRequests"), icon: Coins, to: "/admin/token-economy" },
        { label: t("settings"), icon: Settings, to: "/admin/settings" },
    ];

    const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <DashboardNavbar />
            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar navItems={navItems} showTokenWidget={!isAdmin} />
                <main className="bg-background flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
