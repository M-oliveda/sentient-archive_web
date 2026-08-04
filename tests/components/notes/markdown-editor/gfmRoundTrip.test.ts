import { buildEditorFromExtensions } from "@lexical/extension";
import { $isHorizontalRuleNode } from "@lexical/extension";
import { $isListItemNode, $isListNode, type ListNode } from "@lexical/list";
import { $isTableNode } from "@lexical/table";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/mdast";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getRoot } from "lexical";
import { createMarkdownEditorExtension } from "@/components/notes/markdown-editor/editorExtension";

const GFM_MARKDOWN = [
    "# Flight Training",
    "",
    "---",
    "",
    "| Model | Role |",
    "| --- | --- |",
    "| Cessna 152 | Primary trainer |",
    "",
    "- [x] Budget-friendly training",
    "- [ ] Cross-country capable",
].join("\n");

describe("markdown editor GFM round-trip", () => {
    it("imports GFM constructs into Lexical nodes", () => {
        const editor = buildEditorFromExtensions(
            createMarkdownEditorExtension({
                initialContent: GFM_MARKDOWN,
                readOnly: true,
                onError: jest.fn(),
            }),
        );

        editor.read(() => {
            const children = $getRoot().getChildren();
            const hasHeading = children.some(
                (node) => $isHeadingNode(node) && node.getTag() === "h1",
            );
            const hasHorizontalRule = children.some((node) =>
                $isHorizontalRuleNode(node),
            );
            const hasTable = children.some((node) => $isTableNode(node));
            const hasCheckList = children.some(
                (node) => $isListNode(node) && node.getListType() === "check",
            );

            expect(hasHeading).toBe(true);
            expect(hasHorizontalRule).toBe(true);
            expect(hasTable).toBe(true);
            expect(hasCheckList).toBe(true);
        });

        editor.dispose();
    });

    it("round-trips imported GFM markdown without losing table or task list syntax", () => {
        const editor = buildEditorFromExtensions(
            createMarkdownEditorExtension({
                initialContent: "",
                readOnly: false,
                onError: jest.fn(),
            }),
        );

        editor.update(() => {
            $convertFromMarkdownString(GFM_MARKDOWN);
        });

        const exported = editor.read(() => $convertToMarkdownString());

        expect(exported).toContain("# Flight Training");
        expect(exported).toContain("---");
        expect(exported).toMatch(/\| Model\s+\| Role\s+\|/);
        expect(exported).toMatch(/- \[x\] Budget-friendly training/);
        expect(exported).toMatch(/- \[ \] Cross-country capable/);

        editor.dispose();
    });

    it("preserves checked state on task list items after import", () => {
        const editor = buildEditorFromExtensions(
            createMarkdownEditorExtension({
                initialContent: GFM_MARKDOWN,
                readOnly: true,
                onError: jest.fn(),
            }),
        );

        editor.read(() => {
            const checkList = $getRoot()
                .getChildren()
                .find(
                    (node): node is ListNode =>
                        $isListNode(node) && node.getListType() === "check",
                );

            expect(checkList).toBeDefined();

            const items = checkList!.getChildren().filter($isListItemNode);
            expect(items).toHaveLength(2);
            expect(items[0]?.getChecked()).toBe(true);
            expect(items[1]?.getChecked()).toBe(false);
        });

        editor.dispose();
    });
});
