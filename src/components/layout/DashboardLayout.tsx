import {
    Bot,
    Clock,
    Coins,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { DashboardNavbar } from "./DashboardNavbar";
import { DashboardSidebar, type INavItem } from "./DashboardSidebar";

const CLIENT_NAV_ITEMS: INavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Notes", icon: FileText, to: "/notes" },
    { label: "AI Features", icon: Bot, to: "/ai-features" },
    { label: "Tokens", icon: Coins, to: "/tokens" },
    { label: "Activity", icon: Clock, to: "/activity" },
    { label: "Settings", icon: Settings, to: "/settings" },
];

const ADMIN_NAV_ITEMS: INavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Token Economy", icon: Coins, to: "/admin/token-economy" },
    { label: "Settings", icon: Settings, to: "/settings" },
];

interface IDashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: IDashboardLayoutProps) {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <DashboardNavbar />
            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar navItems={navItems} showTokenWidget={!isAdmin} />
                <main className="bg-background flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
