import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
    FileText,
    Tag,
    Layers,
    Brain,
    Sparkles,
    Coins,
    ArrowRight,
    HandCoins,
    Zap,
    Lightbulb,
    Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useClientConfig } from "@/hooks/useClientConfig";
import { RequestTokensModal } from "@/components/tokens/RequestTokensModal";
import type { IFeatureFlags, ITokenCosts } from "@/types/config";

interface IAIFeatureCard {
    id: "summarize" | "autoTag" | "flashcards" | "ragQuery";
    key: keyof IFeatureFlags;
    icon: typeof FileText;
    costKey: keyof ITokenCosts;
}

const AI_FEATURES: IAIFeatureCard[] = [
    {
        id: "summarize",
        key: "summarizeEnabled",
        icon: FileText,
        costKey: "summarize",
    },
    {
        id: "autoTag",
        key: "autoTagEnabled",
        icon: Tag,
        costKey: "autoTag",
    },
    {
        id: "flashcards",
        key: "flashcardsEnabled",
        icon: Layers,
        costKey: "flashcards",
    },
    {
        id: "ragQuery",
        key: "ragQueryEnabled",
        icon: Brain,
        costKey: "ragQuery",
    },
];

const HOW_IT_WORKS = [
    {
        id: "select",
        icon: HandCoins,
        step: "1",
    },
    {
        id: "spend",
        icon: Zap,
        step: "2",
    },
    {
        id: "insights",
        icon: Lightbulb,
        step: "3",
    },
] as const;

export function AIFeaturesPage() {
    const { t } = useTranslation("ai");
    const { user } = useAuthStore();
    const tokenBalance = useTokenBalance();
    const { features, tokenCosts } = useClientConfig();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const balance = tokenBalance.data?.balance ?? user?.tokenBalance ?? 0;

    const visibleFeatures = useMemo(
        () => AI_FEATURES.filter((feature) => features[feature.key]),
        [features],
    );

    return (
        <>
            <div className="space-y-10 pb-10">
                {/* Hero */}
                <section className="space-y-3">
                    <div className="bg-secondary text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
                        <Sparkles className="text-primary size-4" />
                        {t("hub.badge")}
                    </div>
                    <h1 className="text-foreground text-3xl leading-tight font-bold md:text-4xl">
                        {t("hub.title")}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                        {t("hub.subtitle")}
                    </p>
                </section>

                {/* Token Balance Card */}
                <section>
                    <div className="bg-primary text-primary-foreground flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-primary-foreground/60 text-sm font-medium tracking-wider uppercase">
                                {t("hub.availableBalance")}
                            </p>
                            <p className="text-4xl font-bold tabular-nums">
                                {balance.toLocaleString()}{" "}
                                <span className="text-primary-foreground/60 text-2xl font-normal">
                                    {t("hub.tokens")}
                                </span>
                            </p>
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                                data-testid="top-up-tokens-button"
                            >
                                {t("hub.topUp")}
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                        <div className="bg-primary-foreground/10 hidden rounded-full p-4 sm:block">
                            <Coins className="text-primary-foreground size-8" />
                        </div>
                    </div>
                </section>

                {/* Feature Cards */}
                <section className="space-y-4">
                    {visibleFeatures.length === 0 ? (
                        <p
                            className="text-muted-foreground text-sm"
                            data-testid="no-ai-features"
                        >
                            {t("hub.noFeatures")}
                        </p>
                    ) : (
                        <div
                            className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4"
                            aria-label={t("hub.featuresAriaLabel")}
                        >
                            {visibleFeatures.map((feature) => (
                                <Link
                                    key={feature.id}
                                    to="/notes"
                                    className="bg-brand-500 text-brand-50 flex min-w-62.5 flex-col justify-between gap-4 rounded-3xl p-4 transition-opacity hover:opacity-90 md:min-w-0"
                                    data-testid={`feature-card-${feature.id}`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="bg-brand-50/10 rounded-xl p-2.5">
                                                <feature.icon className="text-brand-50 size-5" />
                                            </div>
                                            <span className="bg-brand-900/30 text-brand-100 rounded-full px-2.5 py-1 text-xs font-semibold">
                                                {t("hub.tokenCost", {
                                                    count: tokenCosts[feature.costKey],
                                                })}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-brand-50 text-lg font-bold">
                                                {t(`hub.features.${feature.id}.name`)}
                                            </p>
                                            <p className="text-brand-100 mt-1 text-sm leading-relaxed">
                                                {t(
                                                    `hub.features.${feature.id}.description`,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-brand-100/60 flex items-center gap-1.5 text-xs">
                                        <Clock className="size-3.5" />
                                        {t("hub.openNote")}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* How Tokens Work */}
                <section className="space-y-5">
                    <h2 className="text-brand-500 text-xl font-bold">
                        {t("hub.howTokensWork")}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {HOW_IT_WORKS.map((step) => (
                            <div key={step.id} className="flex gap-4">
                                <div className="text-primary mt-0.5 shrink-0">
                                    <step.icon className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-foreground font-semibold">
                                        {step.step}. {t(`hub.steps.${step.id}.title`)}
                                    </p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {t(`hub.steps.${step.id}.description`)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <RequestTokensModal
                open={isRequestModalOpen}
                onOpenChange={setIsRequestModalOpen}
            />
        </>
    );
}
