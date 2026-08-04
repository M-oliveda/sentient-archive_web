export function EditorScreen() {
    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-3 w-32 rounded-full" />
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-7 w-28 rounded-xl" />
            </div>
            <div className="border-brand-300/30 bg-brand-700/5 dark:border-brand-100/5 dark:bg-brand-100/5 flex gap-2 rounded-xl border p-2">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-brand-700/10 dark:bg-brand-100/10 size-6 rounded-md"
                    />
                ))}
            </div>
            <div className="flex flex-col gap-2.5">
                <div className="bg-brand-700/25 dark:bg-brand-100/25 h-5 w-3/5 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-full rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-11/12 rounded-full" />
                <div className="bg-brand-700/20 dark:bg-brand-100/20 h-3.5 w-2/5 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-4/5 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-3/4 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-5/6 rounded-full" />
                <div className="bg-brand-700/20 dark:bg-brand-100/20 h-3.5 w-1/3 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 h-2.5 w-3/5 rounded-full" />
            </div>
            <div className="bg-brand-200/60 dark:bg-brand-800/60 flex items-center gap-2 rounded-xl p-2">
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-6 w-20 rounded-full" />
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-6 w-16 rounded-full" />
                <div className="bg-brand-700/10 dark:bg-brand-100/10 ml-auto h-2.5 w-28 rounded-full" />
            </div>
        </div>
    );
}
