import {
    $convertFromMarkdownString,
    MdastCommonMarkExtension,
    MdastExtension,
    MdastGfmExtension,
    MdastShortcutsExtension,
} from "@lexical/mdast";
import { HistoryExtension } from "@lexical/history";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import { TableExtension } from "@lexical/table";
import { type LexicalEditor, configExtension, defineExtension } from "lexical";
import { editorTheme } from "./editorTheme";

interface ICreateMarkdownEditorExtensionOptions {
    initialContent: string;
    readOnly: boolean;
    onError: (error: Error, editor: LexicalEditor) => void;
}

export function createMarkdownEditorExtension({
    initialContent,
    readOnly,
    onError,
}: ICreateMarkdownEditorExtensionOptions) {
    return defineExtension({
        name: "MarkdownEditor",
        namespace: "MarkdownEditor",
        theme: editorTheme,
        editable: !readOnly,
        onError,
        dependencies: [
            RichTextExtension,
            HistoryExtension,
            ListExtension,
            MdastCommonMarkExtension,
            MdastGfmExtension,
            MdastExtension,
            MdastShortcutsExtension,
            CheckListExtension,
            configExtension(TableExtension, {
                hasHorizontalScroll: true,
            }),
        ],
        $initialEditorState() {
            if (initialContent) {
                $convertFromMarkdownString(initialContent);
            }
        },
    });
}
