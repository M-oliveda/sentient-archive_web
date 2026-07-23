import { useState, useEffect } from "react";
import { Brain, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/authStore";
import { useAINoteActions } from "@/hooks/useAINoteActions";
import { useClientConfig } from "@/hooks/useClientConfig";

function friendlyAiError(raw: string | null): string | null {
    if (!raw) return null;
    if (/429|too many requests|rate.?limit|credits depleted|quota/i.test(raw)) {
        return "AI service is temporarily unavailable. Please try again later.";
    }
    return "Something went wrong. Please try again.";
}

interface IRAGQueryModalProps {
    noteId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RAGQueryModal({ noteId, open, onOpenChange }: IRAGQueryModalProps) {
    const { user } = useAuthStore();
    const { tokenCosts } = useClientConfig();
    const tokenCost = tokenCosts.ragQuery;
    const tokenBalance = user?.tokenBalance ?? 0;
    const canAfford = tokenBalance >= tokenCost;
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<string | null>(null);
    const { ragQuery } = useAINoteActions(noteId);

    useEffect(() => {
        if (!open) {
            setQuestion("");
            setAnswer(null);
        }
    }, [open]);

    const handleSubmit = () => {
        if (!question.trim()) return;
        ragQuery.mutate(question.trim(), {
            onSuccess: (data) => {
                setAnswer(data.data.answer);
            },
        });
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(e.target.value);
        if (answer !== null) setAnswer(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const error = friendlyAiError(ragQuery.error?.message ?? null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="text-primary size-5" />
                        Knowledge Q&A
                    </DialogTitle>
                </DialogHeader>

                <p className="text-muted-foreground text-sm">
                    Ask a question and the AI will search across all your notes to
                    generate a contextual answer.
                </p>

                <div className="space-y-3">
                    <textarea
                        value={question}
                        onChange={handleQuestionChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your notes… (Ctrl+Enter to submit)"
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
                        rows={3}
                        data-testid="question-input"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!question.trim() || !canAfford || ragQuery.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="ask-button"
                    >
                        {ragQuery.isPending ? (
                            <>
                                <Spinner className="size-4" />
                                Searching your notes…
                            </>
                        ) : canAfford ? (
                            <>
                                <Send className="size-4" />
                                Ask ({tokenCost} tokens)
                            </>
                        ) : (
                            "Not enough tokens"
                        )}
                    </button>
                </div>

                {error && (
                    <p className="text-error text-sm" data-testid="error-message">
                        {error}
                    </p>
                )}

                {answer !== null && (
                    <div className="bg-muted rounded-xl p-4">
                        <p className="text-foreground mb-2 text-sm font-semibold">
                            Answer
                        </p>
                        <p
                            className="text-foreground text-sm leading-relaxed whitespace-pre-wrap"
                            data-testid="answer-content"
                        >
                            {answer}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
