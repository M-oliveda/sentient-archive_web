import React from "react";
import { render } from "@testing-library/react";
import {
    EditorCommandPlugin,
    type IMarkdownEditorHandle,
} from "@/components/notes/markdown-editor/EditorCommandPlugin";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockUpdate = jest.fn();
const mockEditor = { update: mockUpdate };

jest.mock("@lexical/react/LexicalComposerContext", () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockConvertFrom = jest.fn();
const mockConvertTo = jest.fn().mockReturnValue("existing content");

jest.mock("@lexical/markdown", () => ({
    $convertFromMarkdownString: (...args: unknown[]) => mockConvertFrom(...args),
    $convertToMarkdownString: (...args: unknown[]) => mockConvertTo(...args),
    TRANSFORMERS: [],
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRef(): React.RefObject<IMarkdownEditorHandle | null> {
    return { current: null };
}

function runUpdateCallback() {
    const callback = (mockUpdate as jest.Mock).mock.calls[0][0] as () => void;
    callback();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    mockConvertTo.mockReturnValue("existing content");
});

describe("EditorCommandPlugin – mount", () => {
    it("renders null (no DOM output)", () => {
        const { container } = render(<EditorCommandPlugin />);
        expect(container.firstChild).toBeNull();
    });

    it("does nothing when editorRef is not provided", () => {
        expect(() => render(<EditorCommandPlugin />)).not.toThrow();
    });

    it("sets editorRef.current with prependContent and appendContent", () => {
        const ref = makeRef();
        render(<EditorCommandPlugin editorRef={ref} />);
        expect(ref.current).not.toBeNull();
        expect(typeof ref.current!.prependContent).toBe("function");
        expect(typeof ref.current!.appendContent).toBe("function");
    });
});

describe("EditorCommandPlugin – prependContent", () => {
    it("calls editor.update when invoked", () => {
        const ref = makeRef();
        render(<EditorCommandPlugin editorRef={ref} />);
        ref.current!.prependContent("## New Section");
        expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it("prepends markdown before existing content", () => {
        const ref = makeRef();
        render(<EditorCommandPlugin editorRef={ref} />);
        ref.current!.prependContent("## New Section");
        runUpdateCallback();
        expect(mockConvertFrom).toHaveBeenCalledWith(
            "## New Section\n\nexisting content",
            [],
        );
    });
});

describe("EditorCommandPlugin – appendContent", () => {
    it("calls editor.update when invoked", () => {
        const ref = makeRef();
        render(<EditorCommandPlugin editorRef={ref} />);
        ref.current!.appendContent("## Flashcards");
        expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it("appends markdown after existing content", () => {
        const ref = makeRef();
        render(<EditorCommandPlugin editorRef={ref} />);
        ref.current!.appendContent("## Flashcards");
        runUpdateCallback();
        expect(mockConvertFrom).toHaveBeenCalledWith(
            "existing content\n\n## Flashcards",
            [],
        );
    });
});

describe("EditorCommandPlugin – unmount", () => {
    it("clears editorRef.current on unmount", () => {
        const ref = makeRef();
        const { unmount } = render(<EditorCommandPlugin editorRef={ref} />);
        expect(ref.current).not.toBeNull();
        unmount();
        expect(ref.current).toBeNull();
    });
});
