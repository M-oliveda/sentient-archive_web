import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";
import {
    SCREEN_IDS,
    CYCLE_MS,
    ACTIVE_NAV,
    slideVariants,
    type ScreenId,
} from "./constants";
import { HomeScreen } from "./HomeScreen";
import { NotesScreen } from "./NotesScreen";
import { EditorScreen } from "./EditorScreen";
import { AIFeaturesScreen } from "./AIFeaturesScreen";

const SCREEN_CONTENT: Record<ScreenId, React.FC> = {
    dashboard: HomeScreen,
    notes: NotesScreen,
    editor: EditorScreen,
    ai: AIFeaturesScreen,
};

export function DashboardPreview() {
    const [screenIdx, setScreenIdx] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const currentScreen = SCREEN_IDS[screenIdx] as ScreenId;
    const activeNav = ACTIVE_NAV[currentScreen];

    useEffect(() => {
        if (isPaused) {
            clearInterval(intervalRef.current);
            return;
        }
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setScreenIdx((i) => (i + 1) % SCREEN_IDS.length);
        }, CYCLE_MS);
        return () => {
            clearInterval(intervalRef.current);
        };
    }, [isPaused, resetKey]);

    const handleDotClick = (idx: number) => {
        setScreenIdx(idx);
        setResetKey((k) => k + 1);
    };

    const ScreenContent = SCREEN_CONTENT[currentScreen];

    return (
        <motion.div
            variants={fadeInUp}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-hidden="true"
            data-testid="dashboard-preview"
            className="border-brand-300/30 bg-brand-200/20 dark:border-brand-100/10 dark:bg-brand-100/5 mt-16 w-full overflow-hidden rounded-[3rem] border p-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
        >
            <div className="bg-brand-50 dark:bg-brand-900 flex h-[290px] flex-col overflow-hidden rounded-[2rem] md:h-[460px]">
                {/* Dashboard top-bar */}
                <div className="border-brand-200 bg-brand-100 dark:border-brand-100/5 dark:bg-brand-800 flex shrink-0 items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-700/10 dark:bg-brand-100/10 size-5 rounded-full" />
                        <div className="bg-brand-700/15 dark:bg-brand-100/15 h-3 w-28 rounded-full" />
                    </div>
                    <div className="bg-brand-500/25 dark:bg-brand-400/30 size-7 rounded-full" />
                </div>

                {/* Sidebar + main */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar — collapses for the editor screen */}
                    <motion.div
                        animate={{
                            width: currentScreen === "editor" ? "0px" : "80px",
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-brand-200 bg-brand-100/50 dark:border-brand-100/5 dark:bg-brand-100/5 flex h-full w-20 flex-col border-r">
                            <div className="flex flex-col gap-2 p-3">
                                {[75, 65, 70, 60, 58].map((w, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-6 rounded-lg transition-colors duration-300",
                                            i === activeNav
                                                ? "bg-brand-500/20 dark:bg-brand-400/30"
                                                : "bg-brand-700/5 dark:bg-brand-100/5",
                                        )}
                                        style={{ width: `${w}%` }}
                                    />
                                ))}
                            </div>
                            <div className="border-brand-200 dark:border-brand-100/5 mt-auto border-t p-3">
                                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2 w-full rounded-full" />
                                <div className="bg-brand-700/5 dark:bg-brand-100/5 mt-1.5 h-2 w-3/4 rounded-full" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Animated screen content */}
                    <div className="relative flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentScreen}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute inset-0 overflow-y-auto"
                                data-testid={`screen-${currentScreen}`}
                            >
                                <ScreenContent />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Screen indicator dots */}
                <div className="border-brand-200 dark:border-brand-100/5 flex shrink-0 items-center justify-center gap-2 border-t py-2.5">
                    {SCREEN_IDS.map((_, i) => (
                        <button
                            key={i}
                            data-testid={`screen-dot-${i}`}
                            onClick={() => handleDotClick(i)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                i === screenIdx
                                    ? "bg-brand-600 dark:bg-brand-300 w-4"
                                    : "bg-brand-700/20 dark:bg-brand-100/20 w-1.5",
                            )}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
