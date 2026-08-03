import { createMarkdownEditorExtension } from "@/components/notes/markdown-editor/editorExtension";

describe("createMarkdownEditorExtension", () => {
    it("returns a defined extension object", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "# Hello",
            readOnly: false,
            onError: jest.fn(),
        });

        expect(extension).toBeDefined();
        expect(extension.name).toBe("MarkdownEditor");
        expect(extension.namespace).toBe("MarkdownEditor");
    });

    it("sets editable based on readOnly", () => {
        const editableExtension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: false,
            onError: jest.fn(),
        });
        const readOnlyExtension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: true,
            onError: jest.fn(),
        });

        expect(editableExtension.editable).toBe(true);
        expect(readOnlyExtension.editable).toBe(false);
    });

    it("includes GFM-capable mdast dependencies", () => {
        const extension = createMarkdownEditorExtension({
            initialContent: "",
            readOnly: false,
            onError: jest.fn(),
        });

        const dependencyNames = extension.dependencies?.map((dependency) =>
            typeof dependency === "object" &&
            dependency !== null &&
            "name" in dependency
                ? dependency.name
                : String(dependency),
        );

        expect(dependencyNames).toEqual(
            expect.arrayContaining([
                "@lexical/mdast/CommonMark",
                "@lexical/mdast/Gfm",
                "@lexical/mdast/Mdast",
                "@lexical/mdast/Shortcuts",
            ]),
        );
    });
});
