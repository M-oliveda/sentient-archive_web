import { useMemo } from "react";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { $convertToMarkdownString } from "@lexical/mdast";
import type { EditorState } from "lexical";
import { useTranslation } from "react-i18next";
import { MarkdownFormattingToolbar } from "./MarkdownFormattingToolbar";
import { EditorCommandPlugin, type IMarkdownEditorHandle } from "./EditorCommandPlugin";
import { createMarkdownEditorExtension } from "./editorExtension";

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
    placeholder,
    onChange,
    readOnly = false,
    showToolbar = false,
    editorRef,
}: IMarkdownEditorProps) {
    const { t } = useTranslation("notes");
    const resolvedPlaceholder = placeholder ?? t("editor.placeholder");

    const extension = useMemo(
        () =>
            createMarkdownEditorExtension({
                initialContent,
                readOnly,
                onError: (error) => {
                    console.error("[MarkdownEditor]", error);
                },
            }),
        [initialContent, readOnly],
    );

    const handleChange = (editorState: EditorState) => {
        if (readOnly || !onChange) return;
        editorState.read(() => {
            const markdown = $convertToMarkdownString();
            onChange(markdown);
        });
    };

    return (
        <LexicalExtensionComposer extension={extension} contentEditable={null}>
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
                {!readOnly && showToolbar && <MarkdownFormattingToolbar />}
                <div className="relative flex-1 overflow-y-auto">
                    <ContentEditable
                        className="editor-content min-h-full"
                        aria-label={t("editor.contentAriaLabel")}
                    />
                    {!readOnly && (
                        <div className="editor-placeholder">{resolvedPlaceholder}</div>
                    )}
                    <ListPlugin />
                    <CheckListPlugin disableTakeFocusOnClick={readOnly} />
                    <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
                    <EditorCommandPlugin editorRef={editorRef} />
                </div>
            </div>
        </LexicalExtensionComposer>
    );
}
