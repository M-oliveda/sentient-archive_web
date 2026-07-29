import { useState } from "react";
import { Layers, Sparkles, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { useClientConfig } from "@/hooks/useClientConfig";
import { RAGQueryModal } from "@/components/ai/RAGQueryModal";
import type { INote, IFlashcard } from "@/types/note";
import type { ITokenCosts } from "@/types/config";
import { DEFAULT_TOKEN_COSTS } from "@/types/config";

function friendlyAiErrorKey(raw: string | null): string | null {
    if (!raw) return null;
    if (/429|too many requests|rate.?limit|credits depleted|quota/i.test(raw)) {
        return "assistant.errors.unavailable";
    }
    return "assistant.errors.generic";
}

function formatFlashcardsAsMarkdown(cards: IFlashcard[], heading: string): string {
    const lines = cards
        .map((c) => `**Q:** ${c.front}\n\n**A:** ${c.back}`)
        .join("\n\n---\n\n");
    return `## ${heading}\n\n${lines}`;
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
    const { t } = useTranslation("notes");
    const { user } = useAuthStore();
    const tokenBalance = user?.tokenBalance ?? 0;
    const { features, tokenCosts } = useClientConfig();
    const { summarize, autoTag, flashcards } = useAINoteActions(note.id);
    const updateNote = useUpdateNote();
    const [isKnowledgeQAOpen, setIsKnowledgeQAOpen] = useState(false);

    const handleInsertSummary = () => {
        // note.summary is guaranteed non-null here; button only renders when summary exists
        const heading = t("assistant.summary.markdownHeading");
        onInsertAtStart?.(`## ${heading}\n\n${note.summary!}\n\n---\n\n`);
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
                onAppendContent?.(
                    formatFlashcardsAsMarkdown(
                        data.data.flashcards,
                        t("assistant.flashcards.markdownHeading"),
                    ),
                );
                onOpenChange(false);
            },
        });
    };

    const isTagsPending = autoTag.isPending || updateNote.isPending;
    const hasAnyFeature =
        features.summarizeEnabled ||
        features.autoTagEnabled ||
        features.flashcardsEnabled ||
        features.ragQueryEnabled;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary size-5" />
                            {t("assistant.title")}
                        </DialogTitle>
                    </DialogHeader>

                    {!hasAnyFeature && (
                        <p
                            className="text-muted-foreground text-sm"
                            data-testid="no-ai-features"
                        >
                            {t("assistant.noFeatures")}
                        </p>
                    )}

                    {features.summarizeEnabled && (
                        <SummaryCard
                            summary={note.summary}
                            tokenBalance={tokenBalance}
                            tokenCost={tokenCosts.summarize}
                            isPending={summarize.isPending}
                            errorKey={friendlyAiErrorKey(
                                summarize.error?.message ?? null,
                            )}
                            onGenerate={() => summarize.mutate()}
                            onInsert={handleInsertSummary}
                        />
                    )}
                    {features.autoTagEnabled && (
                        <SuggestedTagsCard
                            note={note}
                            tokenBalance={tokenBalance}
                            tokenCost={tokenCosts.autoTag}
                            isPending={isTagsPending}
                            errorKey={friendlyAiErrorKey(
                                autoTag.error?.message ?? null,
                            )}
                            onGenerate={handleGenerateTags}
                        />
                    )}
                    {features.flashcardsEnabled && (
                        <GenerateFlashcardsCard
                            hasFlashcards={!!note.flashcards?.length}
                            tokenBalance={tokenBalance}
                            tokenCost={tokenCosts.flashcards}
                            isPending={flashcards.isPending}
                            errorKey={friendlyAiErrorKey(
                                flashcards.error?.message ?? null,
                            )}
                            onGenerate={handleGenerateFlashcards}
                        />
                    )}
                    {features.ragQueryEnabled && (
                        <KnowledgeQACard
                            tokenBalance={tokenBalance}
                            tokenCost={tokenCosts.ragQuery}
                            onOpen={() => setIsKnowledgeQAOpen(true)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {features.ragQueryEnabled && (
                <RAGQueryModal
                    noteId={note.id}
                    open={isKnowledgeQAOpen}
                    onOpenChange={setIsKnowledgeQAOpen}
                />
            )}
        </>
    );
}

export function TokenBadge({ count }: { count: number }) {
    const { t } = useTranslation("notes");

    return (
        <span className="bg-foreground text-background rounded-full px-2.5 py-0.5 text-xs font-medium">
            {t(count === 1 ? "assistant.token" : "assistant.tokens", { count })}
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
    tokenCost: number;
    isPending: boolean;
    errorKey: string | null;
    onGenerate: () => void;
    onInsert?: () => void;
}

function SummaryCard({
    summary,
    tokenBalance,
    tokenCost,
    isPending,
    errorKey,
    onGenerate,
    onInsert,
}: ISummaryCardProps) {
    const { t } = useTranslation("notes");
    const canAfford = tokenBalance >= tokenCost;

    return (
        <div className="bg-muted flex flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-bold">
                    {t("assistant.summary.title")}
                </span>
                <TokenBadge count={tokenCost} />
            </div>
            {summary !== null ? (
                <>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {summary}
                    </p>
                    <CardAction onClick={onInsert}>
                        {t("assistant.summary.insert")}
                    </CardAction>
                </>
            ) : (
                <CardAction onClick={onGenerate} disabled={!canAfford || isPending}>
                    {isPending ? (
                        <span className="flex items-center justify-center gap-1.5">
                            <Spinner className="size-4" />
                            {t("assistant.generating")}
                        </span>
                    ) : canAfford ? (
                        t("assistant.summary.generate")
                    ) : (
                        t("assistant.notEnoughTokens")
                    )}
                </CardAction>
            )}
            {errorKey && <p className="text-error text-xs">{t(errorKey)}</p>}
        </div>
    );
}

interface ISuggestedTagsCardProps {
    note: INote;
    tokenBalance: number;
    tokenCost: number;
    isPending: boolean;
    errorKey: string | null;
    onGenerate: () => void;
}

function SuggestedTagsCard({
    note,
    tokenBalance,
    tokenCost,
    isPending,
    errorKey,
    onGenerate,
}: ISuggestedTagsCardProps) {
    const { t } = useTranslation("notes");
    const canAfford = tokenBalance >= tokenCost;
    const hasTags = note.aiTags.length > 0;

    return (
        <div className="bg-muted flex flex-col gap-3 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-bold">
                    {t("assistant.tags.title")}
                </span>
                <TokenBadge count={tokenCost} />
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
                        {hasTags
                            ? t("assistant.regenerating")
                            : t("assistant.generating")}
                    </span>
                ) : canAfford ? (
                    hasTags ? (
                        t("assistant.tags.regenerate")
                    ) : (
                        t("assistant.tags.generate")
                    )
                ) : (
                    t("assistant.notEnoughTokens")
                )}
            </CardAction>
            {errorKey && <p className="text-error text-xs">{t(errorKey)}</p>}
        </div>
    );
}

interface IGenerateFlashcardsCardProps {
    hasFlashcards: boolean;
    tokenBalance: number;
    tokenCost: number;
    isPending: boolean;
    errorKey: string | null;
    onGenerate: () => void;
}

function GenerateFlashcardsCard({
    hasFlashcards,
    tokenBalance,
    tokenCost,
    isPending,
    errorKey,
    onGenerate,
}: IGenerateFlashcardsCardProps) {
    const { t } = useTranslation("notes");
    const canAfford = tokenBalance >= tokenCost;
    const label = hasFlashcards
        ? t("assistant.flashcards.regenerate")
        : t("assistant.flashcards.generate");

    return (
        <div
            className="bg-muted flex flex-col items-center gap-3 rounded-xl p-4"
            data-testid="flashcards-card"
        >
            <div className="bg-secondary rounded-full p-3">
                <Layers className="text-foreground size-6" />
            </div>
            <span className="text-foreground text-sm font-bold">
                {t("assistant.flashcards.title")}
            </span>
            <p className="text-muted-foreground text-center text-sm">
                {t("assistant.flashcards.description")}
            </p>
            <CardAction onClick={onGenerate} disabled={!canAfford || isPending}>
                {isPending ? (
                    <span className="flex items-center justify-center gap-1.5">
                        <Spinner className="size-4" />
                        {t("assistant.generating")}
                    </span>
                ) : canAfford ? (
                    t("assistant.flashcards.withCost", { label, count: tokenCost })
                ) : (
                    t("assistant.notEnoughTokens")
                )}
            </CardAction>
            {errorKey && <p className="text-error text-xs">{t(errorKey)}</p>}
        </div>
    );
}

interface IKnowledgeQACardProps {
    tokenBalance: number;
    tokenCost: number;
    onOpen: () => void;
}

function KnowledgeQACard({ tokenBalance, tokenCost, onOpen }: IKnowledgeQACardProps) {
    const { t } = useTranslation("notes");
    const canAfford = tokenBalance >= tokenCost;

    return (
        <div
            className="bg-muted flex flex-col items-center gap-3 rounded-xl p-4"
            data-testid="knowledge-qa-card"
        >
            <div className="bg-secondary rounded-full p-3">
                <Brain className="text-foreground size-6" />
            </div>
            <span className="text-foreground text-sm font-bold">
                {t("assistant.knowledgeQA.title")}
            </span>
            <p className="text-muted-foreground text-center text-sm">
                {t("assistant.knowledgeQA.description")}
            </p>
            <CardAction onClick={onOpen} disabled={!canAfford}>
                {canAfford
                    ? t("assistant.knowledgeQA.ask", { count: tokenCost })
                    : t("assistant.notEnoughTokens")}
            </CardAction>
        </div>
    );
}

/** Prefer useClientConfig().tokenCosts in new code */
export const TOKEN_COSTS: ITokenCosts = DEFAULT_TOKEN_COSTS;
