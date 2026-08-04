import { motion } from "framer-motion";
import {
    Activity,
    BookOpen,
    Bot,
    FileText,
    FolderTree,
    MessageCircle,
    PenLine,
    Search,
    Tag,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface IFeatureCard {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    tokenCost?: number;
}

const FEATURES: IFeatureCard[] = [
    {
        id: "realTimeSearch",
        icon: Search,
    },
    {
        id: "activityTracking",
        icon: Activity,
    },
    {
        id: "smartNoteTaking",
        icon: PenLine,
    },
    {
        id: "hierarchicalFolders",
        icon: FolderTree,
    },
    {
        id: "aiSummarization",
        icon: FileText,
        tokenCost: 2,
    },
    {
        id: "flashcardGeneration",
        icon: BookOpen,
        tokenCost: 2,
    },
    {
        id: "autoTagging",
        icon: Tag,
        tokenCost: 3,
    },
    {
        id: "knowledgeQa",
        icon: MessageCircle,
        tokenCost: 4,
    },
];

export function FeaturesSection() {
    const { t } = useTranslation("landing");

    return (
        <section id="features" className="px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-foreground text-4xl font-bold">
                        {t("features.title")}
                    </h2>
                    <p className="text-muted-foreground mt-4">
                        {t("features.subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {FEATURES.map(({ id, icon: Icon, tokenCost }) => (
                        <motion.div
                            key={id}
                            variants={fadeInUp}
                            whileHover="hovered"
                            initial="rest"
                            animate="rest"
                            className="bg-muted group relative flex cursor-default flex-col rounded-2xl p-5 text-center md:items-start md:text-left"
                            style={{ willChange: "transform" }}
                        >
                            {/* Hover background overlay */}
                            <motion.div
                                variants={{
                                    rest: { opacity: 0 },
                                    hovered: { opacity: 1 },
                                }}
                                transition={{ duration: 0.2 }}
                                className="bg-brand-300/10 ring-brand-300/30 pointer-events-none absolute inset-0 rounded-2xl ring-1"
                            />

                            <motion.div
                                variants={{
                                    rest: { scale: 1 },
                                    hovered: { scale: 1.1 },
                                }}
                                transition={{ duration: 0.2 }}
                                className="bg-brand-300/30 group-hover:bg-brand-300/60 mx-auto mb-3 flex size-9 items-center justify-center rounded-lg transition-colors duration-200 md:mx-0"
                            >
                                <motion.span
                                    variants={{
                                        rest: { rotate: 0 },
                                        hovered: { rotate: -8 },
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-center"
                                >
                                    <Icon className="text-foreground size-4" />
                                </motion.span>
                            </motion.div>

                            <h3 className="text-foreground group-hover:text-brand-800 mb-1.5 font-bold transition-colors duration-200">
                                {t(`features.items.${id}.title`)}
                            </h3>
                            <p className="text-muted-foreground flex-1 text-xs">
                                {t(`features.items.${id}.description`)}
                            </p>
                            {tokenCost !== undefined && (
                                <span className="text-foreground bg-brand-300/40 group-hover:bg-brand-300/70 mx-auto mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 md:mx-0">
                                    <Bot className="size-3" />
                                    {t("features.tokenCost", { count: tokenCost })}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
