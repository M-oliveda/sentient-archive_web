import { motion } from "framer-motion";
import { Brain, Link2, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const FEATURES = [
    {
        id: "cognitiveSearch",
        icon: Brain,
    },
    {
        id: "autoLinking",
        icon: Link2,
    },
    {
        id: "privateByDesign",
        icon: Shield,
    },
];

export function WhySentientArchiveSection() {
    const { t } = useTranslation("landing");

    return (
        <section className="px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-foreground text-4xl font-bold">
                        {t("why.title")}
                    </h2>
                    <p className="text-muted-foreground mt-4">{t("why.subtitle")}</p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-3"
                >
                    {FEATURES.map(({ id, icon: Icon }) => (
                        <motion.div
                            key={id}
                            variants={fadeInUp}
                            className="bg-muted rounded-2xl p-6"
                        >
                            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-300))]/40">
                                <Icon className="text-foreground size-5" />
                            </div>
                            <h3 className="text-foreground mb-2 font-bold">
                                {t(`why.items.${id}.title`)}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {t(`why.items.${id}.description`)}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
