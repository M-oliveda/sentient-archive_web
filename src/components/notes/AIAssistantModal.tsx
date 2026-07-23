import { useState } from "react";
import { Layers, Sparkles, Brain } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useAINoteActions } from "@/hooks/useAINoteActions";
import { useUpdateNote } from "@/hooks/useNotesMutations";
import { RAGQueryModal } from "@/components/ai/RAGQueryModal";
import type { INote, IFlashcard } from "@/types/note";

function friendlyAiError(raw: string | null): string | null {
    if (!raw) return null;
    if (/429|too many requests|rate.?limit|credits depleted|quota/i.test(raw)) {
        return "AI service is temporarily unavailable. Please try again later.";
    }
    return "Something went wrong. Please try again.";
}

const TOKEN_COSTS = {
    summarize: 5,
    autoTag: 3,
    flashcards: 8,
    ragQuery: 10,
} as const;

function formatFlashcardsAsMarkdown(cards: IFlashcard[]): string {
    const lines = cards
        .map((c) => `**Q:** ${c.front}\n\n**A:** ${c.back}`)
        .join("\n\n---\n\n");
    return `## Flashcards\n\n${lines}`;
}

interface IAIAssistantModalProps {
    note: INote;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsertAtStart?: (text: string) => void;
    onAppendContent?: (text: string) => void;
}

export function AIAssistantModal({
    note,
    open,
    onOpenChange,
    onInsertAtStart,
    onAppendContent,
}: IAIAssistantModalProps) {
    const { user } = useAuthStore();
    const tokenBalance = user?.tokenBalance ?? 0;
    const { summarize, autoTag, flashcards } = useAINoteActions(note.id);
    const updateNote = useUpdateNote();
    const [isKnowledgeQAOpen, setIsKnowledgeQAOpen] = useState(false);

    const handleInsertSummary = () => {
        // note.summary is guaranteed non-null here; button only renders when summary exists
        onInsertAtStart?.(`## Summary\n\n${note.summary!}\n\n---\n\n`);
        onOpenChange(false);
    };

    const handleGenerateTags = () => {
        autoTag.mutate(undefined, {
            onSuccess: (data) => {
                const aiTags = data.data.tags;
                const merged = [...new Set([...note.tags, ...aiTags])];
                updateNote.mutate(
                    { noteId: note.id, tags: merged },
                    { onSuccess: () => onOpenChange(false) },
                );
            },
        });
    };

    const handleGenerateFlashcards = () => {
        flashcards.mutate(undefined, {
            onSuccess: (data) => {
                onAppendContent?.(formatFlashcardsAsMarkdown(data.data.flashcards));
                onOpenChange(false);
            },
        });
    };

    const isTagsPending = autoTag.isPending || updateNote.isPending;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary size-5" />
                            AI Assistant
                        </DialogTitle>
                    </DialogHeader>

                    <SummaryCard
                        summary={note.summary}
                        tokenBalance={tokenBalance}
                        isPending={summarize.isPending}
                        error={friendlyAiError(summarize.error?.message ?? null)}
                        onGenerate={() => summarize.mutate()}
                        onInsert={handleInsertSummary}
                    />
                    <SuggestedTagsCard
                        note={note}
                        tokenBalance={tokenBalance}
                        isPending={isTagsPending}
                        error={friendlyAiError(autoTag.error?.message ?? null)}
                        onGenerate={handleGenerateTags}
                    />
                    <GenerateFlashcardsCard
                        hasFlashcards={!!note.flashcards?.length}
                        tokenBalance={tokenBalance}
                        isPending={flashcards.isPending}
                        error={friendlyAiError(flashcards.error?.message ?? null)}
                        onGenerate={handleGenerateFlashcards}
                    />
                    <KnowledgeQACard
                        tokenBalance={tokenBalance}
                        onOpen={() => setIsKnowledgeQAOpen(true)}
                    />
                </DialogContent>
            </Dialog>

            <RAGQueryModal
                noteId={note.id}
                open={isKnowledgeQAOpen}
                onOpenChange={setIsKnowledgeQAOpen}
            />
        </>
    );
}

export function TokenBadge({ count }: { count: number }) {
    return (
        <span className="bg-foreground text-background rounded-full px-2.5 py-0.5 text-xs font-medium">
            {count} {count === 1 ? "token" : "tokens"}
        </span>
    );
}

function CardAction({
    children,
    onClick,
    disabled,
    "data-testid": testId,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    "data-testid"?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            data-testid={testId}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </button>
    );
}

interface ISummaryCardProps {
    summary: string | null;
    tokenBalance: number;
    isPending: boolean;
    error: string | null;
    onGenerate: () => void;
    onInsert?: () => void;
}

function SummaryCard({
    summary,
    tokenBalance,
    isPending,
    error,
    onGenerate,
    onInsert,
}: ISummaryCardProps) {
    const canAfford = tokenBalance >= TOKEN_COSTS.summarize;

    return (
        <div className="bg-muted flex flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-bold">Summary</span>
                <TokenBadge count={TOKEN_COSTS.summarize} />
            </div>
            {summary !== null ? (
                <>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {summary}
                    </p>
                    <CardAction onClick={onInsert}>Insert at top</CardAction>
                </>
            ) : (
                <CardAction onClick={onGenerate} disabled={!canAfford || isPending}>
                    {isPending ? (
                        <span className="flex items-center justify-center gap-1.5">
                            <Spinner className="size-4" />
                            Generating…
                        </span>
                    ) : canAfford ? (
                        "Generate Summary"
                    ) : (
                        "Not enough tokens"
                    )}
                </CardAction>
            )}
            {error && <p className="text-error text-xs">{error}</p>}
        </div>
    );
}

interface ISuggestedTagsCardProps {
    note: INote;
    tokenBalance: number;
    isPending: boolean;
    error: string | null;
    onGenerate: () => void;
}

function SuggestedTagsCard({
    note,
    tokenBalance,
    isPending,
    error,
    onGenerate,
}: ISuggestedTagsCardProps) {
    const canAfford = tokenBalance >= TOKEN_COSTS.autoTag;
    const hasTags = note.aiTags.length > 0;

    return (
        <div className="bg-muted flex flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-bold">
                    Suggested Tags
                </span>
                <TokenBadge count={TOKEN_COSTS.autoTag} />
            </div>
            {hasTags && (
                <div className="flex flex-wrap gap-1.5">
                    {note.aiTags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            <CardAction onClick={onGenerate} disabled={!canAfford || isPending}>
                {isPending ? (
                    <span className="flex items-center justify-center gap-1.5">
                        <Spinner className="size-4" />
                        {hasTags ? "Regenerating…" : "Generating…"}
                    </span>
                ) : canAfford ? (
                    hasTags ? (
                        "Regenerate Tags"
                    ) : (
                        "Generate Tags"
                    )
                ) : (
                    "Not enough tokens"
                )}
            </CardAction>
            {error && <p className="text-error text-xs">{error}</p>}
        </div>
    );
}

interface IGenerateFlashcardsCardProps {
    hasFlashcards: boolean;
    tokenBalance: number;
    isPending: boolean;
    error: string | null;
    onGenerate: () => void;
}

function GenerateFlashcardsCard({
    hasFlashcards,
    tokenBalance,
    isPending,
    error,
    onGenerate,
}: IGenerateFlashcardsCardProps) {
    const canAfford = tokenBalance >= TOKEN_COSTS.flashcards;
    const label = hasFlashcards ? "Regenerate" : "Generate";

    return (
        <div
            className="bg-muted flex flex-col items-center gap-3 rounded-xl p-4"
            data-testid="flashcards-card"
        >
            <div className="bg-secondary rounded-full p-3">
                <Layers className="text-foreground size-6" />
            </div>
            <span className="text-foreground text-sm font-bold">
                Generate Flashcards
            </span>
            <p className="text-muted-foreground text-center text-sm">
                Create study aids from this note.
            </p>
            <CardAction onClick={onGenerate} disabled={!canAfford || isPending}>
                {isPending ? (
                    <span className="flex items-center justify-center gap-1.5">
                        <Spinner className="size-4" />
                        Generating…
                    </span>
                ) : canAfford ? (
                    `${label} (${TOKEN_COSTS.flashcards} tokens)`
                ) : (
                    "Not enough tokens"
                )}
            </CardAction>
            {error && <p className="text-error text-xs">{error}</p>}
        </div>
    );
}

interface IKnowledgeQACardProps {
    tokenBalance: number;
    onOpen: () => void;
}

function KnowledgeQACard({ tokenBalance, onOpen }: IKnowledgeQACardProps) {
    const canAfford = tokenBalance >= TOKEN_COSTS.ragQuery;

    return (
        <div
            className="bg-muted flex flex-col items-center gap-3 rounded-xl p-4"
            data-testid="knowledge-qa-card"
        >
            <div className="bg-secondary rounded-full p-3">
                <Brain className="text-foreground size-6" />
            </div>
            <span className="text-foreground text-sm font-bold">Knowledge Q&A</span>
            <p className="text-muted-foreground text-center text-sm">
                Ask questions and get answers sourced from all your notes.
            </p>
            <CardAction onClick={onOpen} disabled={!canAfford}>
                {canAfford
                    ? `Ask a Question (${TOKEN_COSTS.ragQuery} tokens)`
                    : "Not enough tokens"}
            </CardAction>
        </div>
    );
}
