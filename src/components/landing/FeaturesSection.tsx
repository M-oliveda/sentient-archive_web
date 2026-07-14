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
import { fadeInUp, staggerContainer } from "@/lib/animations";

interface IFeatureCard {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    tokenCost?: number;
}

const FEATURES: IFeatureCard[] = [
    {
        icon: Search,
        title: "Real-Time Search",
        description:
            "Find exactly what you are looking for in milliseconds with semantic search capabilities.",
    },
    {
        icon: Activity,
        title: "Activity Tracking",
        description:
            "Visualize your learning habits and track your productivity with growth over time.",
    },
    {
        icon: PenLine,
        title: "Smart Note-Taking",
        description:
            "Capture ideas instantly with our distraction-free editor designed for speed and clarity.",
    },
    {
        icon: FolderTree,
        title: "Hierarchical Folders",
        description:
            "Organize your thoughts with infinite nested folders and smart categories.",
    },
    {
        icon: FileText,
        title: "AI Summarization",
        description:
            "Condense long articles and papers into concise summaries automatically.",
        tokenCost: 2,
    },
    {
        icon: BookOpen,
        title: "Flashcard Generation",
        description:
            "Automatically generate study flashcards from your notes to reinforce learning and retention.",
        tokenCost: 2,
    },
    {
        icon: Tag,
        title: "Auto-Tagging",
        description:
            "Let AI organize your library by automatically assigning relevant tags and categories.",
        tokenCost: 3,
    },
    {
        icon: MessageCircle,
        title: "Knowledge Q&A",
        description:
            "Ask questions to your knowledge base and get answers based on your notes.",
        tokenCost: 4,
    },
];

export function FeaturesSection() {
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
                        Everything You Need to Build Your Knowledge Empire
                    </h2>
                    <p className="text-muted-foreground mt-4">
                        Powerful AI features to help you capture, organize, and learn
                        from your notes without the friction.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {FEATURES.map(({ icon: Icon, title, description, tokenCost }) => (
                        <motion.div
                            key={title}
                            variants={fadeInUp}
                            whileHover="hovered"
                            initial="rest"
                            animate="rest"
                            className="bg-muted group relative flex cursor-default flex-col rounded-2xl p-5"
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
                                className="bg-brand-300/30 group-hover:bg-brand-300/60 mb-3 flex size-9 items-center justify-center rounded-lg transition-colors duration-200"
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

                            <h3 className="text-foreground group-hover:text-brand-300 mb-1.5 font-bold transition-colors duration-200">
                                {title}
                            </h3>
                            <p className="text-muted-foreground flex-1 text-xs">
                                {description}
                            </p>
                            {tokenCost !== undefined && (
                                <span className="text-foreground bg-brand-300/40 group-hover:bg-brand-300/70 mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200">
                                    <Bot className="size-3" />
                                    {tokenCost} tokens
                                </span>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
