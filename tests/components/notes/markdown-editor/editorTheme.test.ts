import { editorTheme } from "@/components/notes/markdown-editor/editorTheme";

describe("editorTheme", () => {
    it("exports CSS class names for headings", () => {
        expect(editorTheme.heading?.h1).toBe("editor-h1");
        expect(editorTheme.heading?.h2).toBe("editor-h2");
        expect(editorTheme.heading?.h3).toBe("editor-h3");
        expect(editorTheme.heading?.h4).toBe("editor-h4");
        expect(editorTheme.heading?.h5).toBe("editor-h5");
        expect(editorTheme.heading?.h6).toBe("editor-h6");
    });

    it("exports CSS class names for lists", () => {
        expect(editorTheme.list?.ul).toBe("editor-ul");
        expect(editorTheme.list?.ol).toBe("editor-ol");
        expect(editorTheme.list?.listitem).toBe("editor-listitem");
        expect(editorTheme.list?.checklist).toBe("editor-checklist");
        expect(editorTheme.list?.listitemChecked).toBe("editor-listitem-checked");
        expect(editorTheme.list?.listitemUnchecked).toBe("editor-listitem-unchecked");
        expect(editorTheme.list?.nested?.listitem).toBe("editor-nested-listitem");
    });

    it("exports a class name for blockquote", () => {
        expect(editorTheme.quote).toBe("editor-quote");
    });

    it("exports class names for inline text decorations", () => {
        expect(editorTheme.text?.bold).toBe("editor-text-bold");
        expect(editorTheme.text?.italic).toBe("editor-text-italic");
        expect(editorTheme.text?.underline).toBe("editor-text-underline");
        expect(editorTheme.text?.strikethrough).toBe("editor-text-strikethrough");
        expect(editorTheme.text?.code).toBe("editor-text-code");
    });

    it("exports class names for code, link, and horizontal rule", () => {
        expect(editorTheme.code).toBe("editor-code-block");
        expect(editorTheme.link).toBe("editor-link");
        expect(editorTheme.hr).toBe("editor-hr");
    });

    it("exports class names for GFM tables", () => {
        expect(editorTheme.table).toBe("editor-table");
        expect(editorTheme.tableCell).toBe("editor-table-cell");
        expect(editorTheme.tableCellHeader).toBe("editor-table-cell-header");
        expect(editorTheme.tableRow).toBe("editor-table-row");
        expect(editorTheme.tableScrollableWrapper).toBe("editor-table-scroll-wrapper");
    });

    it("exports a class name for paragraphs", () => {
        expect(editorTheme.paragraph).toBe("editor-paragraph");
    });
});
