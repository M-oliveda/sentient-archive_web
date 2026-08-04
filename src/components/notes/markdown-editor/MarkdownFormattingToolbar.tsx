import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
    $createHeadingNode,
    $isHeadingNode,
    $createQuoteNode,
} from "@lexical/rich-text";
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    $isListNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface IFormatState {
    bold: boolean;
    italic: boolean;
    h1: boolean;
    h2: boolean;
    bulletList: boolean;
    orderedList: boolean;
    quote: boolean;
    code: boolean;
}

const INITIAL_FORMAT: IFormatState = {
    bold: false,
    italic: false,
    h1: false,
    h2: false,
    bulletList: false,
    orderedList: false,
    quote: false,
    code: false,
};

export function MarkdownFormattingToolbar() {
    const { t } = useTranslation("notes");
    const [editor] = useLexicalComposerContext();
    const [fmt, setFmt] = useState<IFormatState>(INITIAL_FORMAT);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    setFmt(INITIAL_FORMAT);
                    return;
                }

                const anchorNode = selection.anchor.getNode();
                const element =
                    anchorNode.getKey() === "root"
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();

                let h1 = false;
                let h2 = false;
                let bulletList = false;
                let orderedList = false;
                let quote = false;
                let code = false;

                if ($isHeadingNode(element)) {
                    const tag = element.getTag();
                    h1 = tag === "h1";
                    h2 = tag === "h2";
                } else if ($isListNode(element)) {
                    const listType = element.getListType();
                    bulletList = listType === "bullet";
                    orderedList = listType === "number";
                } else {
                    const type = element.getType();
                    quote = type === "quote";
                    code = type === "code";
                }

                setFmt({
                    bold: selection.hasFormat("bold"),
                    italic: selection.hasFormat("italic"),
                    h1,
                    h2,
                    bulletList,
                    orderedList,
                    quote,
                    code,
                });
            });
        });
    }, [editor]);

    const applyHeading = useCallback(
        (tag: "h1" | "h2") => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(tag));
                }
            });
        },
        [editor],
    );

    const applyQuote = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    }, [editor]);

    const applyCode = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createCodeNode());
            }
        });
    }, [editor]);

    const insertLink = useCallback(() => {
        const url = window.prompt(t("editor.enterUrl"));
        if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url });
        }
    }, [editor, t]);

    const buttons = [
        {
            icon: Bold,
            label: t("editor.format.bold"),
            active: fmt.bold,
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
        },
        {
            icon: Italic,
            label: t("editor.format.italic"),
            active: fmt.italic,
            onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
        },
        {
            icon: Heading1,
            label: t("editor.format.h1"),
            active: fmt.h1,
            onClick: () => applyHeading("h1"),
        },
        {
            icon: Heading2,
            label: t("editor.format.h2"),
            active: fmt.h2,
            onClick: () => applyHeading("h2"),
        },
        {
            icon: List,
            label: t("editor.format.bulletList"),
            active: fmt.bulletList,
            onClick: () =>
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
        },
        {
            icon: ListOrdered,
            label: t("editor.format.numberedList"),
            active: fmt.orderedList,
            onClick: () =>
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
        },
        {
            icon: Link,
            label: t("editor.format.link"),
            active: false,
            onClick: insertLink,
        },
        {
            icon: Quote,
            label: t("editor.format.blockquote"),
            active: fmt.quote,
            onClick: applyQuote,
        },
        {
            icon: Code,
            label: t("editor.format.codeBlock"),
            active: fmt.code,
            onClick: applyCode,
        },
    ];

    return (
        <div className="bg-muted/50 flex items-center gap-0.5 rounded-lg p-1">
            {buttons.map(({ icon: Icon, label, active, onClick }) => (
                <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    aria-label={label}
                    aria-pressed={active}
                    className={cn(
                        "rounded p-1.5 transition-colors",
                        active
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    )}
                >
                    <Icon className="size-4" />
                </button>
            ))}
        </div>
    );
}
