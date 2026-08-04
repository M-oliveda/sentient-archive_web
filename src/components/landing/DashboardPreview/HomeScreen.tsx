export function HomeScreen() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
                <div className="bg-brand-700/15 dark:bg-brand-100/15 h-5 w-2/5 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-3 w-3/5 rounded-full" />
            </div>
            <div className="flex gap-2.5">
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-8 w-28 rounded-xl" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-8 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-brand-700/5 dark:bg-brand-100/5 rounded-xl p-3"
                    >
                        <div className="bg-brand-700/20 dark:bg-brand-100/20 mb-2 h-5 w-10 rounded-full" />
                        <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-12 rounded-full" />
                    </div>
                ))}
            </div>
            <div className="bg-brand-700/10 dark:bg-brand-100/10 h-3 w-24 rounded-full" />
            <div className="border-brand-300/30 bg-brand-700/5 dark:border-brand-100/5 dark:bg-brand-100/5 rounded-xl border p-3">
                <div className="bg-brand-700/20 dark:bg-brand-100/20 mb-2 h-3.5 w-3/5 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 mb-1.5 h-2.5 w-full rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-4/5 rounded-full" />
                <div className="mt-3 flex gap-2">
                    <div className="bg-brand-500/20 dark:bg-brand-400/20 h-5 w-16 rounded-full" />
                    <div className="bg-brand-500/20 dark:bg-brand-400/20 h-5 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}
