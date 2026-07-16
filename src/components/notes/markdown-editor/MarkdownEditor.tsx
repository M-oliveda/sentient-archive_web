import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from "@lexical/markdown";
import type { EditorState } from "lexical";
import { editorTheme } from "./editorTheme";
import { EDITOR_NODES } from "./editorNodes";
import { MarkdownFormattingToolbar } from "./MarkdownFormattingToolbar";
import { EditorCommandPlugin, type IMarkdownEditorHandle } from "./EditorCommandPlugin";

interface IMarkdownEditorProps {
    initialContent: string;
    placeholder?: string;
    onChange?: (markdown: string) => void;
    readOnly?: boolean;
    showToolbar?: boolean;
    editorRef?: React.RefObject<IMarkdownEditorHandle | null>;
}

export function MarkdownEditor({
    initialContent,
    placeholder = "Start writing… (markdown shortcuts supported)",
    onChange,
    readOnly = false,
    showToolbar = false,
    editorRef,
}: IMarkdownEditorProps) {
    const handleChange = (editorState: EditorState) => {
        if (readOnly || !onChange) return;
        editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            onChange(markdown);
        });
    };

    const initialConfig = {
        namespace: "MarkdownEditor",
        nodes: EDITOR_NODES,
        theme: editorTheme,
        editable: !readOnly,
        editorState: () => $convertFromMarkdownString(initialContent, TRANSFORMERS),
        onError: (error: Error) => {
            console.error("[MarkdownEditor]", error);
        },
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
                {!readOnly && showToolbar && <MarkdownFormattingToolbar />}
                <div className="relative flex-1 overflow-y-auto">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="editor-content min-h-full"
                                aria-label="Note content"
                            />
                        }
                        placeholder={
                            <div className="editor-placeholder">{placeholder}</div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
                    <EditorCommandPlugin editorRef={editorRef} />
                </div>
            </div>
        </LexicalComposer>
    );
}
