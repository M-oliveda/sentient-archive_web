import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { $convertToMarkdownString } from "@lexical/mdast";

let capturedExtension: unknown = null;
let capturedOnChange: ((es: unknown, editor: unknown) => void) | null = null;

jest.mock("@lexical/react/LexicalExtensionComposer", () => ({
    LexicalExtensionComposer: ({
        extension,
        children,
    }: {
        extension: unknown;
        children: React.ReactNode;
    }) => {
        capturedExtension = extension;
        return <>{children}</>;
    },
}));

jest.mock("@lexical/react/LexicalContentEditable", () => ({
    ContentEditable: (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props} />
    ),
}));

jest.mock("@lexical/react/LexicalListPlugin", () => ({
    ListPlugin: () => null,
}));

jest.mock("@lexical/react/LexicalCheckListPlugin", () => ({
    CheckListPlugin: () => null,
}));

jest.mock("@lexical/react/LexicalOnChangePlugin", () => ({
    OnChangePlugin: ({
        onChange,
    }: {
        onChange: (es: unknown, editor: unknown) => void;
    }) => {
        capturedOnChange = onChange;
        return null;
    },
}));

jest.mock("@lexical/mdast", () => ({
    $convertFromMarkdownString: jest.fn(),
    $convertToMarkdownString: jest.fn().mockReturnValue("# Converted"),
}));

const mockCreateExtension = jest.fn((options: unknown) => ({
    kind: "markdown-editor-extension",
    options,
}));

jest.mock("@/components/notes/markdown-editor/editorExtension", () => ({
    createMarkdownEditorExtension: (options: unknown) => mockCreateExtension(options),
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
        capturedExtension = null;
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

    it("does not render the placeholder when readOnly is true", () => {
        render(<MarkdownEditor initialContent="" readOnly placeholder="Type here" />);
        expect(screen.queryByText("Type here")).not.toBeInTheDocument();
    });

    it("renders the content-editable area with aria-label", () => {
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);
        expect(screen.getByLabelText("editor.contentAriaLabel")).toBeInTheDocument();
    });

    it("creates a markdown editor extension with initial content", () => {
        render(<MarkdownEditor initialContent="# Hello" onChange={jest.fn()} />);
        expect(mockCreateExtension).toHaveBeenCalledWith(
            expect.objectContaining({
                initialContent: "# Hello",
                readOnly: false,
            }),
        );
        expect(capturedExtension).toEqual(
            expect.objectContaining({ kind: "markdown-editor-extension" }),
        );
    });

    it("calls onChange with converted markdown when OnChangePlugin fires", () => {
        const onChange = jest.fn();
        render(<MarkdownEditor initialContent="" onChange={onChange} />);

        const mockEditor = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.({}, mockEditor);
        });

        expect($convertToMarkdownString).toHaveBeenCalledWith();
        expect(onChange).toHaveBeenCalledWith("# Converted");
    });

    it("passes readOnly to createMarkdownEditorExtension", () => {
        render(<MarkdownEditor initialContent="" readOnly />);
        expect(mockCreateExtension).toHaveBeenCalledWith(
            expect.objectContaining({ readOnly: true }),
        );
    });

    it("calls console.error via the onError handler passed to createMarkdownEditorExtension", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        render(<MarkdownEditor initialContent="" onChange={jest.fn()} />);

        const capturedOptions = mockCreateExtension.mock.calls[0]?.[0] as {
            onError: (error: Error) => void;
        };
        const error = new Error("editor crash");
        act(() => {
            capturedOptions.onError(error);
        });

        expect(consoleSpy).toHaveBeenCalledWith("[MarkdownEditor]", error);
        consoleSpy.mockRestore();
    });

    it("does not call onChange when readOnly and OnChangePlugin fires", () => {
        const onChange = jest.fn();
        render(<MarkdownEditor initialContent="" readOnly onChange={onChange} />);

        const mockEditor = { read: (fn: () => void) => fn() };
        act(() => {
            capturedOnChange?.({}, mockEditor);
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
