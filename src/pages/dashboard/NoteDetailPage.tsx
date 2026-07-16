import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useNote } from "@/hooks/useNote";
import { useFolders } from "@/hooks/useFolders";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AIAssistantModal } from "@/components/notes/AIAssistantModal";
import { ReadNoteView } from "@/components/notes/ReadNoteView";
import { Spinner } from "@/components/ui/spinner";
import type { IMarkdownEditorHandle } from "@/components/notes/markdown-editor";

interface INoteDetailPageProps {
    noteId: string;
}

export function NoteDetailPage({ noteId }: INoteDetailPageProps) {
    const navigate = useNavigate();
    const [editParam] = useQueryState("edit");
    const [isEditing, setIsEditing] = useState(editParam === "1");
    const [isAIOpen, setIsAIOpen] = useState(false);

    const { data: note, isLoading, isError } = useNote(noteId);
    const { data: folders = [] } = useFolders();

    const editorHandleRef = useRef<IMarkdownEditorHandle | null>(null);

    useEffect(() => {
        if (isError) void navigate({ to: "/notes" });
    }, [isError, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner className="size-6" />
            </div>
        );
    }

    if (!note) return null;

    const folderName = note.folderId
        ? folders.find((f) => f.id === note.folderId)?.name
        : undefined;

    if (isEditing) {
        return (
            <>
                <div className="h-full overflow-hidden">
                    <NoteEditor
                        noteId={noteId}
                        onBack={() => setIsEditing(false)}
                        onToggleAI={() => setIsAIOpen((prev) => !prev)}
                        onDeleted={() => void navigate({ to: "/notes" })}
                        editorHandleRef={editorHandleRef}
                    />
                </div>
                <AIAssistantModal
                    note={note}
                    open={isAIOpen}
                    onOpenChange={setIsAIOpen}
                    onInsertAtStart={(text) =>
                        editorHandleRef.current?.prependContent(text)
                    }
                    onAppendContent={(text) =>
                        editorHandleRef.current?.appendContent(text)
                    }
                />
            </>
        );
    }

    return (
        <ReadNoteView
            note={note}
            folderName={folderName}
            onEdit={() => setIsEditing(true)}
        />
    );
}
