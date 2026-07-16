import { useState } from "react";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type SaveStatus = "idle" | "saving" | "saved";

interface IEditorToolbarProps {
    title: string;
    saveStatus: SaveStatus;
    onTitleChange: (title: string) => void;
    onDelete: () => void;
    onBack?: () => void;
    onToggleAI?: () => void;
}

export function EditorToolbar({
    title,
    saveStatus,
    onTitleChange,
    onDelete,
    onBack,
    onToggleAI,
}: IEditorToolbarProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const showStatus = saveStatus !== "idle";

    return (
        <div className="border-border flex items-center gap-3 border-b pb-3">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1 transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft className="size-4" />
                </button>
            )}

            <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled"
                className="border-0 bg-transparent pr-0 pl-2 text-xl font-bold shadow-none focus-visible:ring-0"
                aria-label="Note title"
            />

            <div className="flex shrink-0 items-center gap-2">
                {onToggleAI && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onToggleAI}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3 text-xs"
                        aria-label="Toggle AI Tools"
                    >
                        Toggle AI Tools
                    </Button>
                )}

                <span
                    className="text-muted-foreground flex items-center gap-1 text-xs transition-opacity"
                    style={{ opacity: showStatus ? 1 : 0 }}
                    aria-live="polite"
                >
                    {saveStatus === "saving" && (
                        <>
                            <Loader2 className="size-3 animate-spin" />
                            Saving
                        </>
                    )}
                    {saveStatus === "saved" && (
                        <>
                            <Check className="size-3 text-[hsl(var(--success))]" />
                            Saved
                        </>
                    )}
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive h-7 w-7 p-0"
                    aria-label="Delete note"
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <Trash2 />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Delete note?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The note will be permanently
                            deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={onDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
