import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { PenLine, Sparkles, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const STEPS = [
    {
        id: "createAccount",
        icon: UserPlus,
    },
    {
        id: "captureKnowledge",
        icon: PenLine,
    },
    {
        id: "unlockInsights",
        icon: Sparkles,
    },
];

const STEP_DURATION = 1500;

export function HowItWorksSection() {
    const { t } = useTranslation("landing");
    const gridRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(gridRef, { once: true, margin: "-100px" });
    const [activeStep, setActiveStep] = useState<number | null>(null);

    // Start highlight cycle after entry animations finish (~1s after section enters view)
    useEffect(() => {
        if (!isInView) return;
        const start = setTimeout(() => setActiveStep(0), 1000);
        return () => clearTimeout(start);
    }, [isInView]);

    // Advance to the next step; after the last one, set null so all cards light up and stop
    useEffect(() => {
        if (activeStep === null) return;
        const advance = setTimeout(
            () =>
                setActiveStep((prev) =>
                    prev === null || prev >= STEPS.length - 1 ? null : prev + 1,
                ),
            STEP_DURATION,
        );
        return () => clearTimeout(advance);
    }, [activeStep]);

    return (
        <section id="how-it-works" className="px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-foreground text-4xl font-bold">
                        {t("howItWorks.title")}
                    </h2>
                    <p className="text-muted-foreground mt-4">
                        {t("howItWorks.subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    ref={gridRef}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-3"
                >
                    {STEPS.map(({ id, icon: Icon }, index) => {
                        const isActive = activeStep === null || activeStep === index;
                        return (
                            // Outer div: drives the stagger entry via variants
                            <motion.div key={id} variants={fadeInUp}>
                                {/* Inner div: drives the ongoing highlight animation */}
                                <motion.div
                                    animate={{
                                        opacity: isActive ? 1 : 0.45,
                                        scale: activeStep === index ? 1.02 : 1,
                                        filter:
                                            activeStep !== null && activeStep !== index
                                                ? "grayscale(1)"
                                                : "grayscale(0)",
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="flex h-75 flex-col items-center"
                                >
                                    {/* Icon floating above card with dashed connectors */}
                                    <div className="relative mb-4 flex w-full items-center justify-center">
                                        {/* Vertical connector upward (mobile only, non-first) */}
                                        {index > 0 && (
                                            <div className="border-muted-foreground/30 absolute bottom-full left-1/2 h-6 w-0 border-l-2 border-dashed sm:hidden" />
                                        )}
                                        {/* Horizontal connector left (desktop only, non-first) */}
                                        {index > 0 && (
                                            <div className="border-muted-foreground/30 absolute top-1/2 right-1/2 -left-3 hidden -translate-y-1/2 border-t-2 border-dashed sm:block" />
                                        )}
                                        <div className="ring-border bg-muted relative z-10 flex size-12 items-center justify-center rounded-xl ring-1">
                                            <Icon className="text-foreground size-6" />
                                        </div>
                                        {/* Horizontal connector right (desktop only, non-last) */}
                                        {index < STEPS.length - 1 && (
                                            <div className="border-muted-foreground/30 absolute top-1/2 -right-3 left-1/2 hidden -translate-y-1/2 border-t-2 border-dashed sm:block" />
                                        )}
                                    </div>

                                    {/* Card — flex-1 fills remaining column height for equal card sizes */}
                                    <div className="bg-muted relative flex w-full flex-1 flex-col justify-center overflow-hidden rounded-2xl p-6 text-center">
                                        <p className="text-muted-foreground/10 pointer-events-none absolute top-2 right-4 text-6xl font-bold select-none">
                                            0{index + 1}
                                        </p>
                                        <p className="text-muted-foreground mb-2 block text-xs font-semibold tracking-widest uppercase">
                                            {t("howItWorks.stepLabel", {
                                                number: index + 1,
                                            })}
                                        </p>
                                        <h3 className="text-foreground mb-2 font-bold">
                                            {t(`howItWorks.steps.${id}.title`)}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            {t(`howItWorks.steps.${id}.description`)}
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mt-12 flex justify-center"
                >
                    <Link to="/signup">
                        <Button size="lg">{t("howItWorks.cta")}</Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
