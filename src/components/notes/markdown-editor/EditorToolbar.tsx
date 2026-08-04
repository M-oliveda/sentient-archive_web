import { useState } from "react";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("notes");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const showStatus = saveStatus !== "idle";

    return (
        <div className="border-border flex items-center gap-3 border-b pb-3">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1 transition-colors"
                    aria-label={t("editor.back")}
                >
                    <ArrowLeft className="size-4" />
                </button>
            )}

            <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={t("editor.untitled")}
                className="border-0 bg-transparent pr-0 pl-2 text-xl font-bold shadow-none focus-visible:ring-0"
                aria-label={t("editor.titleAriaLabel")}
            />

            <div className="flex shrink-0 items-center gap-2">
                {onToggleAI && (
                    <Button
                        type="button"
                        size="sm"
                        onClick={onToggleAI}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3 text-xs"
                        aria-label={t("editor.toggleAI")}
                    >
                        {t("editor.toggleAI")}
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
                            {t("editor.saving")}
                        </>
                    )}
                    {saveStatus === "saved" && (
                        <>
                            <Check className="size-3 text-[hsl(var(--success))]" />
                            {t("editor.saved")}
                        </>
                    )}
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive hover:text-destructive h-7 w-7 p-0"
                    aria-label={t("editor.deleteNote")}
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
                        <AlertDialogTitle>
                            {t("editor.deleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("editor.deleteConfirmDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("editor.cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={onDelete}>
                            {t("editor.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
