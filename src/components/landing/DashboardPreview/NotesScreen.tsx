const cards = [
    { title: 68, lines: [90, 75, 55] },
    { title: 75, lines: [85, 65, 45] },
    { title: 55, lines: [80, 70, 50] },
    { title: 70, lines: [88, 60, 42] },
];

export function NotesScreen() {
    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-brand-700/20 dark:bg-brand-100/20 h-5 w-20 rounded-full" />
                    <div className="bg-brand-500/20 dark:bg-brand-400/20 h-5 w-10 rounded-full" />
                </div>
                <div className="bg-brand-500/25 dark:bg-brand-400/30 h-8 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="border-brand-300/30 bg-brand-700/5 dark:border-brand-100/5 dark:bg-brand-100/5 rounded-xl border p-3"
                    >
                        <div
                            className="bg-brand-700/20 dark:bg-brand-100/20 mb-2 h-3.5 rounded-full"
                            style={{ width: `${card.title}%` }}
                        />
                        {card.lines.map((w, j) => (
                            <div
                                key={j}
                                className="bg-brand-700/10 dark:bg-brand-100/10 mb-1 h-2 rounded-full"
                                style={{ width: `${w}%` }}
                            />
                        ))}
                        <div className="mt-2 flex gap-1.5">
                            <div className="bg-brand-500/20 dark:bg-brand-400/20 h-4 w-14 rounded-full" />
                            <div className="bg-brand-500/20 dark:bg-brand-400/20 h-4 w-10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
