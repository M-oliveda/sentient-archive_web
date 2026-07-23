import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { RequestTokensModal } from "@/components/tokens/RequestTokensModal";

const TOKEN_COSTS = {
    summarize: 5,
    autoTag: 3,
    flashcards: 8,
    ragQuery: 10,
} as const;

const AI_FEATURES = [
    {
        icon: FileText,
        name: "Smart Summarization",
        description:
            "Use AI to generate a concise and useful summarization of any note.",
        tokenCost: TOKEN_COSTS.summarize,
    },
    {
        icon: Tag,
        name: "Semantic Auto-Tagging",
        description:
            "Automatically organize your notes. The AI analyzes context and appends relevant tags to improve search ability.",
        tokenCost: TOKEN_COSTS.autoTag,
    },
    {
        icon: Layers,
        name: "Flash Generator",
        description:
            "Turn your study notes or technical documentation into active recall flashcards instantly.",
        tokenCost: TOKEN_COSTS.flashcards,
    },
    {
        icon: Brain,
        name: "Knowledge Q&A",
        description:
            "Ask questions across your entire archive. The AI retrieves relevant notes and generates a contextual answer.",
        tokenCost: TOKEN_COSTS.ragQuery,
    },
] as const;

const HOW_IT_WORKS = [
    {
        icon: HandCoins,
        step: "1",
        title: "Select a Feature",
        description:
            "Open any note, click the AI assistant button, and choose the AI tool that fits your current task from the hub.",
    },
    {
        icon: Zap,
        step: "2",
        title: "Spend Tokens",
        description:
            "Tokens are deducted from your wallet based on the complexity of the operation.",
    },
    {
        icon: Lightbulb,
        step: "3",
        title: "Get Insights",
        description: "Receive instant results generated directly from your archives.",
    },
] as const;

export function AIFeaturesPage() {
    const { user } = useAuthStore();
    const tokenBalance = useTokenBalance();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const balance = tokenBalance.data?.balance ?? user?.tokenBalance ?? 0;

    return (
        <>
            <div className="space-y-10 pb-10">
                {/* Hero */}
                <section className="space-y-3">
                    <div className="bg-secondary text-foreground inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
                        <Sparkles className="text-primary size-4" />
                        AI Features Hub
                    </div>
                    <h1 className="text-foreground text-3xl leading-tight font-bold md:text-4xl">
                        Supercharge Your Knowledge
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
                        Unlock deep insights, generate summaries, and organize your
                        chaotic thoughts instantly with our AI-powered toolset.
                    </p>
                </section>

                {/* Token Balance Card */}
                <section>
                    <div className="bg-primary text-primary-foreground flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-primary-foreground/60 text-sm font-medium tracking-wider uppercase">
                                Available Balance
                            </p>
                            <p className="text-4xl font-bold tabular-nums">
                                {balance.toLocaleString()}{" "}
                                <span className="text-primary-foreground/60 text-2xl font-normal">
                                    tokens
                                </span>
                            </p>
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                                data-testid="top-up-tokens-button"
                            >
                                Top Up Tokens
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
                    <div
                        className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4"
                        aria-label="AI features"
                    >
                        {AI_FEATURES.map((feature) => (
                            <Link
                                key={feature.name}
                                to="/notes"
                                className="bg-brand-500 text-brand-50 flex min-w-[250px] flex-col justify-between gap-4 rounded-3xl p-4 transition-opacity hover:opacity-90 md:min-w-0"
                                data-testid={`feature-card-${feature.name}`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="bg-brand-50/10 rounded-xl p-2.5">
                                            <feature.icon className="text-brand-50 size-5" />
                                        </div>
                                        <span className="bg-brand-900/30 text-brand-100 rounded-full px-2.5 py-1 text-xs font-semibold">
                                            {feature.tokenCost} tokens
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-brand-50 text-lg font-bold">
                                            {feature.name}
                                        </p>
                                        <p className="text-brand-100 mt-1 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-brand-100/60 flex items-center gap-1.5 text-xs">
                                    <Clock className="size-3.5" />
                                    Open a note to use
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* How Tokens Work */}
                <section className="space-y-5">
                    <h2 className="text-brand-500 text-xl font-bold">
                        How Tokens Work
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {HOW_IT_WORKS.map((step) => (
                            <div key={step.title} className="flex gap-4">
                                <div className="text-primary mt-0.5 shrink-0">
                                    <step.icon className="size-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-foreground font-semibold">
                                        {step.step}. {step.title}
                                    </p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {step.description}
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
