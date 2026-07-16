import { EDITOR_NODES } from "@/components/notes/markdown-editor/editorNodes";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";

describe("EDITOR_NODES", () => {
    it("is an array", () => {
        expect(Array.isArray(EDITOR_NODES)).toBe(true);
    });

    it("includes HeadingNode", () => {
        expect(EDITOR_NODES).toContain(HeadingNode);
    });

    it("includes QuoteNode", () => {
        expect(EDITOR_NODES).toContain(QuoteNode);
    });

    it("includes ListNode and ListItemNode", () => {
        expect(EDITOR_NODES).toContain(ListNode);
        expect(EDITOR_NODES).toContain(ListItemNode);
    });

    it("includes CodeNode and CodeHighlightNode", () => {
        expect(EDITOR_NODES).toContain(CodeNode);
        expect(EDITOR_NODES).toContain(CodeHighlightNode);
    });

    it("includes LinkNode and AutoLinkNode", () => {
        expect(EDITOR_NODES).toContain(LinkNode);
        expect(EDITOR_NODES).toContain(AutoLinkNode);
    });

    it("contains exactly 8 node types", () => {
        expect(EDITOR_NODES).toHaveLength(8);
    });
});
