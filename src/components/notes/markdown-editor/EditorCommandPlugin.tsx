import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from "@lexical/markdown";

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
                    const current = $convertToMarkdownString(TRANSFORMERS);
                    $convertFromMarkdownString(
                        markdown + "\n\n" + current,
                        TRANSFORMERS,
                    );
                });
            },
            appendContent(markdown: string) {
                editor.update(() => {
                    const current = $convertToMarkdownString(TRANSFORMERS);
                    $convertFromMarkdownString(
                        current + "\n\n" + markdown,
                        TRANSFORMERS,
                    );
                });
            },
        };
        return () => {
            editorRef.current = null;
        };
    }, [editor, editorRef]);

    return null;
}
