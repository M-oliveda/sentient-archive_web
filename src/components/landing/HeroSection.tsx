import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export function HeroSection() {
    const { t } = useTranslation("landing");

    return (
        <section className="flex flex-col items-center px-4 pt-20 pb-24 text-center">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="flex w-full max-w-4xl flex-col items-center"
            >
                <motion.span
                    variants={fadeInUp}
                    className="border-border text-foreground mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                >
                    <svg
                        width="6"
                        height="6"
                        viewBox="0 0 6 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1"
                    >
                        <rect width="6" height="6" rx="3" fill="#10B981" />
                    </svg>
                    {t("hero.badge")}
                </motion.span>

                <motion.h1
                    variants={fadeInUp}
                    className="text-foreground max-w-3xl text-5xl leading-tight font-bold tracking-tight sm:text-6xl"
                >
                    {t("hero.title")}{" "}
                    <span className="text-muted-foreground">
                        {t("hero.titleAccent")}
                    </span>
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="text-muted-foreground mt-6 max-w-xl text-base"
                >
                    {t("hero.description")}
                </motion.p>

                <motion.div variants={fadeInUp} className="mt-8">
                    <Link to="/signup">
                        <Button size="lg">{t("hero.cta")}</Button>
                    </Link>
                </motion.div>

                <DashboardPreview />
            </motion.div>
        </section>
    );
}
