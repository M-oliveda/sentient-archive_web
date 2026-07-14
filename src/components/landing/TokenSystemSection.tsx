import { motion } from "framer-motion";
import { BookOpen, CoinsIcon, FileText, MessageCircle, Tag } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const TOKEN_COSTS = [
    { icon: Tag, label: "Auto-Tagging", cost: "1 token" },
    { icon: FileText, label: "Summarization", cost: "2 tokens" },
    { icon: BookOpen, label: "Flashcards", cost: "3 tokens" },
    { icon: MessageCircle, label: "Q&A Chat", cost: "4 tokens per query" },
];

export function TokenSystemSection() {
    return (
        <section id="token-system" className="px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <motion.div
                        className="mb-4 flex justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <CoinsIcon className="text-brand-300 size-12" />
                    </motion.div>
                    <h2 className="text-foreground text-4xl font-bold">
                        Simple Token-Based System
                    </h2>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-2"
                >
                    {/* Explanation — intentionally dark card in both modes */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl p-8"
                        style={{
                            background:
                                "linear-gradient(135deg, #5E503F 0%, #22333B 100%)",
                        }}
                    >
                        <ul className="text-brand-100 space-y-4 text-sm">
                            <li>
                                Every new user starts with{" "}
                                <span className="text-brand-300 font-bold underline">
                                    20 free
                                </span>{" "}
                                tokens to explore all AI features.
                            </li>
                            <li>
                                Each AI operation costs a small number of tokens based
                                on complexity.
                            </li>
                            <li>
                                Need more? Simply request additional tokens from your
                                dashboard.
                            </li>
                        </ul>
                    </motion.div>

                    {/* Cost grid */}
                    <motion.div
                        variants={staggerContainer}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        {TOKEN_COSTS.map(({ icon: Icon, label, cost }) => (
                            <motion.div
                                key={label}
                                variants={fadeInUp}
                                whileHover="hovered"
                                initial="rest"
                                animate="rest"
                                className="bg-muted group relative flex cursor-default flex-col items-center justify-center rounded-2xl p-5 text-center"
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
                                    className="bg-brand-300/30 group-hover:bg-brand-300/60 mb-3 flex size-10 items-center justify-center rounded-xl transition-colors duration-200"
                                >
                                    <motion.span
                                        variants={{
                                            rest: { rotate: 0 },
                                            hovered: { rotate: -8 },
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center justify-center"
                                    >
                                        <Icon className="text-foreground size-5" />
                                    </motion.span>
                                </motion.div>

                                <p className="text-foreground group-hover:text-brand-300 font-bold transition-colors duration-200">
                                    {label}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {cost}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
