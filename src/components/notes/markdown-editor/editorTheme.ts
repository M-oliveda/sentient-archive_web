import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
    heading: {
        h1: "editor-h1",
        h2: "editor-h2",
        h3: "editor-h3",
        h4: "editor-h4",
        h5: "editor-h5",
        h6: "editor-h6",
    },
    hr: "editor-hr",
    list: {
        ul: "editor-ul",
        ol: "editor-ol",
        listitem: "editor-listitem",
        checklist: "editor-checklist",
        listitemChecked: "editor-listitem-checked",
        listitemUnchecked: "editor-listitem-unchecked",
        nested: {
            listitem: "editor-nested-listitem",
        },
    },
    quote: "editor-quote",
    code: "editor-code-block",
    link: "editor-link",
    table: "editor-table",
    tableCell: "editor-table-cell",
    tableCellHeader: "editor-table-cell-header",
    tableRow: "editor-table-row",
    tableScrollableWrapper: "editor-table-scroll-wrapper",
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        code: "editor-text-code",
    },
    paragraph: "editor-paragraph",
};
