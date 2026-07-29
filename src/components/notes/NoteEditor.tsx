import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNote } from "@/hooks/useNote";
import { useUpdateNote, useDeleteNote } from "@/hooks/useNotesMutations";
import { Spinner } from "@/components/ui/spinner";
import { MarkdownEditor, EditorToolbar } from "./markdown-editor";
import type { SaveStatus, IMarkdownEditorHandle } from "./markdown-editor";

const AUTO_SAVE_DELAY_MS = 1500;

interface ILexicalNoteEditorProps {
    noteId: string;
    initialTitle: string;
    initialContent: string;
    initialTags: string[];
    onBack?: () => void;
    onToggleAI?: () => void;
    onDeleted: () => void;
    editorHandleRef?: React.RefObject<IMarkdownEditorHandle | null>;
}

function LexicalNoteEditor({
    noteId,
    initialTitle,
    initialContent,
    initialTags,
    onBack,
    onToggleAI,
    onDeleted,
    editorHandleRef,
}: ILexicalNoteEditorProps) {
    const { t } = useTranslation("notes");
    const updateNote = useUpdateNote();
    const deleteNote = useDeleteNote();

    const [title, setTitle] = useState(initialTitle);
    const [tags, setTags] = useState(initialTags);
    const [tagInput, setTagInput] = useState("");

    // Sync tags when an external action (e.g. AI auto-apply) updates them in Firestore
    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestContentRef = useRef(initialContent);
    const latestTitleRef = useRef(initialTitle);

    const scheduleSave = useCallback(
        (content: string, noteTitle: string) => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
            setSaveStatus("saving");
            autoSaveTimer.current = setTimeout(async () => {
                await updateNote.mutateAsync({ noteId, content, title: noteTitle });
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            }, AUTO_SAVE_DELAY_MS);
        },
        [noteId, updateNote],
    );

    const handleContentChange = useCallback(
        (markdown: string) => {
            if (markdown !== latestContentRef.current) {
                latestContentRef.current = markdown;
                scheduleSave(markdown, latestTitleRef.current);
            }
        },
        [scheduleSave],
    );

    const handleTitleChange = useCallback(
        (newTitle: string) => {
            setTitle(newTitle);
            latestTitleRef.current = newTitle;
            scheduleSave(latestContentRef.current, newTitle);
        },
        [scheduleSave],
    );

    const handleDelete = useCallback(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        deleteNote.mutate(noteId, { onSuccess: onDeleted });
    }, [deleteNote, noteId, onDeleted]);

    const handleAddTag = useCallback(async () => {
        const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
        if (!trimmed || tags.includes(trimmed)) {
            setTagInput("");
            return;
        }
        const newTags = [...tags, trimmed];
        setTags(newTags);
        setTagInput("");
        await updateNote.mutateAsync({ noteId, tags: newTags });
    }, [tagInput, tags, noteId, updateNote]);

    const handleRemoveTag = useCallback(
        async (tag: string) => {
            const newTags = tags.filter((t) => t !== tag);
            setTags(newTags);
            await updateNote.mutateAsync({ noteId, tags: newTags });
        },
        [tags, noteId, updateNote],
    );

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleAddTag();
        }
    };

    useEffect(() => {
        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        };
    }, []);

    return (
        <div className="flex h-full flex-col gap-4">
            <EditorToolbar
                title={title}
                saveStatus={saveStatus}
                onTitleChange={handleTitleChange}
                onDelete={handleDelete}
                onBack={onBack}
                onToggleAI={onToggleAI}
            />
            <MarkdownEditor
                key={noteId}
                initialContent={initialContent}
                onChange={handleContentChange}
                showToolbar
                editorRef={editorHandleRef}
            />
            <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => void handleRemoveTag(tag)}
                            className="hover:opacity-70"
                            aria-label={t("editor.removeTag", { tag })}
                        >
                            <X className="size-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t("editor.addTagPlaceholder")}
                    className="text-muted-foreground placeholder:text-muted-foreground min-w-24 bg-transparent text-sm outline-none"
                    aria-label={t("editor.addTag")}
                />
            </div>
        </div>
    );
}

interface INoteEditorProps {
    noteId: string;
    onDeleted: () => void;
    onBack?: () => void;
    onToggleAI?: () => void;
    editorHandleRef?: React.RefObject<IMarkdownEditorHandle | null>;
}

export function NoteEditor({
    noteId,
    onDeleted,
    onBack,
    onToggleAI,
    editorHandleRef,
}: INoteEditorProps) {
    const { data: note, isLoading, isError } = useNote(noteId);

    useEffect(() => {
        if (isError) onDeleted();
    }, [isError, onDeleted]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (!note) return null;

    return (
        <LexicalNoteEditor
            noteId={noteId}
            initialTitle={note.title}
            initialContent={note.content}
            initialTags={note.tags}
            onBack={onBack}
            onToggleAI={onToggleAI}
            onDeleted={onDeleted}
            editorHandleRef={editorHandleRef}
        />
    );
}
