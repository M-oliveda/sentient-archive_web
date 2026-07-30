import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SentientArchiveLogo } from "@/components/branding/SentientArchiveLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const NAV_LINKS = [
    { href: "#features", labelKey: "nav.features" },
    { href: "#how-it-works", labelKey: "nav.howItWorks" },
    { href: "#token-system", labelKey: "nav.tokenSystem" },
];

export function PublicNavbar() {
    const { t } = useTranslation("landing");
    const [mobileOpen, setMobileOpen] = useState(false);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        if (!mobileOpen) {
            hamburgerRef.current?.focus();
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    return (
        <>
            <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
                <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                    <SentientArchiveLogo />

                    <div className="hidden items-center gap-6 md:flex">
                        {NAV_LINKS.map(({ href, labelKey }) => (
                            <a
                                key={href}
                                href={href}
                                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
                            >
                                {t(labelKey)}
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <LanguageSwitcher />
                        <Link
                            to="/login"
                            className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
                        >
                            {t("nav.logIn")}
                        </Link>
                        <Link to="/signup">
                            <Button
                                variant="default"
                                size="default"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {t("nav.getStarted")}
                            </Button>
                        </Link>
                    </div>

                    <button
                        ref={hamburgerRef}
                        className="text-foreground flex items-center justify-center rounded-full p-2 transition-opacity hover:opacity-80 md:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label={t("nav.openMenu")}
                        aria-expanded={mobileOpen}
                    >
                        <Menu className="size-5" />
                    </button>
                </nav>
            </header>

            {/* Mobile menu overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 transition-opacity duration-300 md:hidden",
                    mobileOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0",
                )}
            >
                {/* Backdrop */}
                <div
                    data-testid="mobile-menu-backdrop"
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />

                {/* Panel — inert when closed so keyboard/AT can't reach hidden content */}
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("nav.navigationMenu")}
                    inert={!mobileOpen}
                    className={cn(
                        "bg-background absolute top-0 right-0 flex h-dvh max-h-dvh w-77.5 flex-col transition-transform duration-300 ease-in-out",
                        mobileOpen ? "translate-x-0" : "translate-x-full",
                    )}
                >
                    {/* Header */}
                    <div className="flex h-17 shrink-0 items-center justify-between px-6 py-4">
                        <SentientArchiveLogo onClick={() => setMobileOpen(false)} />
                        <button
                            className="text-foreground flex size-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                            onClick={() => setMobileOpen(false)}
                            aria-label={t("nav.closeMenu")}
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-4 py-6">
                        {/* Nav links */}
                        <div className="flex flex-col gap-2">
                            {NAV_LINKS.map(({ href, labelKey }) => (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-between px-4 py-4"
                                >
                                    <span className="text-foreground text-sm font-medium">
                                        {t(labelKey)}
                                    </span>
                                    <ChevronRight className="text-foreground/40 size-5 shrink-0" />
                                </a>
                            ))}
                        </div>

                        {/* Version card */}
                        <div className="border-brand-100 from-primary/10 relative overflow-hidden rounded-2xl border bg-linear-to-br to-transparent p-4">
                            <div className="relative z-10 flex flex-col gap-1">
                                <p className="text-foreground text-sm font-bold">
                                    {t("nav.newVersionTitle")}
                                </p>
                                <p className="text-foreground/60 text-xs leading-4">
                                    {t("nav.newVersionDescription")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer — pinned above mobile browser chrome / home indicator */}
                    <div className="flex shrink-0 flex-col gap-4 px-10 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                        <div className="flex justify-center">
                            <LanguageSwitcher />
                        </div>
                        <Link to="/signup" onClick={() => setMobileOpen(false)}>
                            <Button variant="secondary" size="sm" className="w-full">
                                {t("nav.getStarted")}
                            </Button>
                        </Link>
                        <Link to="/login" onClick={() => setMobileOpen(false)}>
                            <Button
                                variant="default"
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                            >
                                {t("nav.logIn")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
