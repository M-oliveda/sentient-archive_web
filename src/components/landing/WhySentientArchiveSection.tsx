import { motion } from "framer-motion";
import { Brain, Link2, Shield } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const FEATURES = [
    {
        icon: Brain,
        title: "Cognitive Search",
        description:
            "Don't just match keywords. Our AI understands the intent behind your query and surfaces relevant concepts.",
    },
    {
        icon: Link2,
        title: "Auto-Linking",
        description:
            "New entries are automatically connected to existing knowledge nodes, creating a web of insight without manual effort.",
    },
    {
        icon: Shield,
        title: "Private by Design",
        description:
            "Your knowledge base is encrypted locally. Not even our AI models train on your personal data without consent.",
    },
];

export function WhySentientArchiveSection() {
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
                        Why SentientArchive?
                    </h2>
                    <p className="text-muted-foreground mt-4">
                        Designed for researchers, writers, and knowledge workers who
                        need more than just storage.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-3"
                >
                    {FEATURES.map(({ icon: Icon, title, description }) => (
                        <motion.div
                            key={title}
                            variants={fadeInUp}
                            className="bg-muted rounded-2xl p-6"
                        >
                            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-300))]/40">
                                <Icon className="text-foreground size-5" />
                            </div>
                            <h3 className="text-foreground mb-2 font-bold">{title}</h3>
                            <p className="text-muted-foreground text-sm">
                                {description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
