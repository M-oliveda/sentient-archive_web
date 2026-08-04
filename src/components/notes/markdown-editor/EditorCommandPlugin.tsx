import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/mdast";

export interface IMarkdownEditorHandle {
    prependContent: (markdown: string) => void;
    appendContent: (markdown: string) => void;
}

interface IEditorCommandPluginProps {
    editorRef?: React.RefObject<IMarkdownEditorHandle | null>;
}

export function EditorCommandPlugin({ editorRef }: IEditorCommandPluginProps) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editorRef) return;
        editorRef.current = {
            prependContent(markdown: string) {
                editor.update(() => {
                    const current = $convertToMarkdownString();
                    $convertFromMarkdownString(markdown + "\n\n" + current);
                });
            },
            appendContent(markdown: string) {
                editor.update(() => {
                    const current = $convertToMarkdownString();
                    $convertFromMarkdownString(current + "\n\n" + markdown);
                });
            },
        };
        return () => {
            editorRef.current = null;
        };
    }, [editor, editorRef]);

    return null;
}
