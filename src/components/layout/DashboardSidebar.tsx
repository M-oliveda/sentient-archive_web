import { Link, useRouterState } from "@tanstack/react-router";
import { Power } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth-service";
import { useAuthStore } from "@/stores/authStore";
import { TokenWidget } from "./TokenWidget";
import { LanguageSwitcher } from "./LanguageSwitcher";

export interface INavItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    to: string;
}

interface IDashboardSidebarProps {
    navItems: INavItem[];
    showTokenWidget?: boolean;
}

export function DashboardSidebar({
    navItems,
    showTokenWidget = false,
}: IDashboardSidebarProps) {
    const { t } = useTranslation("layout");
    const { location } = useRouterState();
    const { user } = useAuthStore();

    const handleLogout = async () => {
        await authService.signOut();
    };

    return (
        <aside className="bg-secondary border-border my-5 flex w-16 shrink-0 flex-col rounded-r-lg border py-6 md:w-64">
            <nav className="flex-1 px-2 md:px-4" aria-label={t("mainNavigation")}>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            location.pathname === item.to ||
                            location.pathname.startsWith(item.to + "/");
                        return (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className={cn(
                                        "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors md:justify-start md:px-3",
                                        isActive
                                            ? "text-foreground"
                                            : "text-foreground/70 hover:text-foreground",
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <item.icon className="size-5 shrink-0" />
                                    <span className="hidden md:block">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="space-y-4 px-2 md:px-4">
                {showTokenWidget && user && (
                    <div className="hidden md:block">
                        <TokenWidget balance={user.tokenBalance ?? 0} />
                    </div>
                )}
                <div className="flex w-full justify-center md:justify-start">
                    <LanguageSwitcher />
                </div>
                <button
                    onClick={handleLogout}
                    aria-label={t("logout")}
                    className="flex w-full items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-[hsl(var(--error))] transition-colors hover:text-[hsl(var(--error))]/80 md:justify-start md:px-3"
                >
                    <Power className="size-5 shrink-0" />
                    <span className="hidden md:block">{t("logout")}</span>
                </button>
            </div>
        </aside>
    );
}
