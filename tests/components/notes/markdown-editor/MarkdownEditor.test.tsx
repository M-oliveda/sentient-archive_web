import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from "@lexical/markdown";

let capturedInitialConfig: Record<string, unknown> = {};
let capturedOnChange: ((es: unknown) => void) | null = null;

jest.mock("@lexical/react/LexicalComposer", () => ({
    LexicalComposer: ({
        initialConfig,
        children,
    }: {
        initialConfig: Record<string, unknown>;
        children: React.ReactNode;
    }) => {
        capturedInitialConfig = initialConfig;
        if (typeof initialConfig.editorState === "function") {
            (initialConfig.editorState as () => void)();
        }
        return <>{children}</>;
    },
}));

jest.mock("@lexical/react/LexicalRichTextPlugin", () => ({
    RichTextPlugin: ({
        contentEditable,
        placeholder,
    }: {
        contentEditable: React.ReactNode;
        placeholder: React.ReactNode;
    }) => (
        <div>
            {contentEditable}
            {placeholder}
        </div>
    ),
}));

jest.mock("@lexical/react/LexicalContentEditable", () => ({
    ContentEditable: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props} />
    ),
}));

jest.mock("@lexical/react/LexicalHistoryPlugin", () => ({
    HistoryPlugin: () => null,
}));

jest.mock("@lexical/react/LexicalListPlugin", () => ({
    ListPlugin: () => null,
}));

jest.mock("@lexical/react/LexicalMarkdownShortcutPlugin", () => ({
    MarkdownShortcutPlugin: () => null,
}));

jest.mock("@lexical/react/LexicalErrorBoundary", () => ({
    LexicalErrorBoundary: () => null,
}));

jest.mock("@lexical/react/LexicalOnChangePlugin", () => ({
    OnChangePlugin: ({ onChange }: { onChange: (es: unknown) => void }) => {
        capturedOnChange = onChange;
        return null;
    },
}));

jest.mock("@lexical/markdown", () => ({
    $convertFromMarkdownString: jest.fn(),
    $convertToMarkdownString: jest.fn().mockReturnValue("# Converted"),
    TRANSFORMERS: [],
}));

jest.mock("@/components/notes/markdown-editor/MarkdownFormattingToolbar", () => ({
    MarkdownFormattingToolbar: () => <div data-testid="mock-formatting-toolbar" />,
}));

const mockEditorCommandPlugin = jest.fn();
jest.mock("@/components/notes/markdown-editor/EditorCommandPlugin", () => ({
    EditorCommandPlugin: (props: { editorRef?: { current: unknown } }) => {
        mockEditorCommandPlugin(props);
        return null;
    },
}));

import { MarkdownEditor } from "@/components/notes/markdown-editor/MarkdownEditor";

describe("MarkdownEditor", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnChange = null;
        capturedInitialConfig = {};
        mockEditorCommandPlugin.mockReset();
    });

    it("renders the placeholder text", () => {
        render(
            <MarkdownEditor
                initialContent=""
                placeholder="Type here"
                onChange={jest.fn()}
            />,
        );
        expect(screen.getByText("Type here")).toBeInTheDocument();
    });

    it("uses default placeholder when none provided", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(screen.getByText("editor.placeholder")).toBeInTheDocument();
    });

    it("renders the content-editable area with aria-label", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(screen.getByLabelText("editor.contentAriaLabel")).toBeInTheDocument();
    });

    it("calls $convertFromMarkdownString with initialContent on mount", () => {
        render(<MarkdownEditor initialContent="# Hello" onChange={jest.fn()} />);
        expect($convertFromMarkdownString).toHaveBeenCalledWith("# Hello", []);
    });

    it("calls onChange with converted markdown when OnChangePlugin fires", () => {
        const onChange = jest.fn();
        render(<MarkdownEditor initialContent="" onChange={onChange} />);

        const mockEditorState = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.(mockEditorState);
        });

        expect($convertToMarkdownString).toHaveBeenCalledWith([]);
        expect(onChange).toHaveBeenCalledWith("# Converted");
    });

    it("calls console.error via onError handler", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);

        const error = new Error("editor crash");
        act(() => {
            (capturedInitialConfig.onError as (e: Error) => void)?.(error);
        });

        expect(consoleSpy).toHaveBeenCalledWith("[MarkdownEditor]", error);
        consoleSpy.mockRestore();
    });

    it("sets editable to true when readOnly is not provided", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(capturedInitialConfig.editable).toBe(true);
    });

    it("sets editable to false when readOnly is true", () => {
        render(<MarkdownEditor initialContent="" readOnly />);
        expect(capturedInitialConfig.editable).toBe(false);
    });

    it("does not call onChange when readOnly and OnChangePlugin fires", () => {
        const onChange = jest.fn();
        render(<MarkdownEditor initialContent="" readOnly onChange={onChange} />);

        const mockEditorState = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.(mockEditorState);
        });

        expect(onChange).not.toHaveBeenCalled();
    });

    it("works without onChange prop when readOnly is true", () => {
        render(<MarkdownEditor initialContent="# Hello" readOnly />);
        expect(screen.getByLabelText("editor.contentAriaLabel")).toBeInTheDocument();
    });

    it("renders MarkdownFormattingToolbar when showToolbar is true and not readOnly", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} showToolbar />);
        expect(screen.getByTestId("mock-formatting-toolbar")).toBeInTheDocument();
    });

    it("does not render MarkdownFormattingToolbar when showToolbar is false", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(screen.queryByTestId("mock-formatting-toolbar")).not.toBeInTheDocument();
    });

    it("does not render MarkdownFormattingToolbar when readOnly even if showToolbar", () => {
        render(<MarkdownEditor initialContent="" readOnly showToolbar />);
        expect(screen.queryByTestId("mock-formatting-toolbar")).not.toBeInTheDocument();
    });

    it("passes editorRef to EditorCommandPlugin when provided", () => {
        const editorRef = { current: null };
        render(
            <MarkdownEditor
                initialContent=""
                onChange={jest.fn()}
                editorRef={editorRef}
            />,
        );
        expect(mockEditorCommandPlugin).toHaveBeenCalledWith(
            expect.objectContaining({ editorRef }),
        );
    });

    it("passes undefined editorRef to EditorCommandPlugin when not provided", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(mockEditorCommandPlugin).toHaveBeenCalledWith(
            expect.objectContaining({ editorRef: undefined }),
        );
    });
});
