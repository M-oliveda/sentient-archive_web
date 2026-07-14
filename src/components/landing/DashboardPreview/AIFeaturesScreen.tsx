export function AIFeaturesScreen() {
    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="bg-brand-500/25 dark:bg-brand-400/30 h-6 w-32 rounded-full" />
            <div className="bg-brand-700/25 dark:bg-brand-100/25 h-5 w-4/5 rounded-full" />
            <div className="bg-brand-700/10 dark:bg-brand-100/10 h-3 w-3/5 rounded-full" />
            <div className="bg-brand-700/5 dark:bg-brand-100/5 rounded-xl p-3">
                <div className="bg-brand-700/10 dark:bg-brand-100/10 mb-1 h-2.5 w-28 rounded-full" />
                <div className="bg-brand-700/20 dark:bg-brand-100/20 mb-2 h-6 w-20 rounded-full" />
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-7 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-brand-700/5 dark:bg-brand-100/5 rounded-xl p-2.5"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="bg-brand-500/20 dark:bg-brand-400/20 size-7 rounded-lg" />
                            <div className="bg-brand-500/20 dark:bg-brand-400/20 h-4 w-14 rounded-full" />
                        </div>
                        <div className="bg-brand-700/15 dark:bg-brand-100/15 mb-1 h-3 w-full rounded-full" />
                        <div className="bg-brand-700/15 dark:bg-brand-100/15 h-3 w-3/4 rounded-full" />
                        <div className="bg-brand-700/10 dark:bg-brand-100/10 mt-2 h-2 w-full rounded-full" />
                        <div className="bg-brand-700/10 dark:bg-brand-100/10 mt-1 h-2 w-2/3 rounded-full" />
                        <div className="bg-brand-700/10 dark:bg-brand-100/10 mt-2 h-2.5 w-24 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
