import { render, screen, fireEvent, act } from "@testing-library/react";

const mockDispatchCommand = jest.fn();
const mockUpdate = jest.fn().mockImplementation((fn: () => void) => fn());
let capturedListener:
    | ((update: { editorState: { read: (fn: () => void) => void } }) => void)
    | null = null;
const mockRegisterUpdateListener = jest
    .fn()
    .mockImplementation((fn: (u: unknown) => void) => {
        capturedListener = fn as typeof capturedListener;
        return () => {
            capturedListener = null;
        };
    });

const mockEditor = {
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
    registerUpdateListener: mockRegisterUpdateListener,
};

jest.mock("@lexical/react/LexicalComposerContext", () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGetSelection = jest.fn().mockReturnValue(null);
const mockIsRangeSelection = jest.fn().mockReturnValue(false);

jest.mock("lexical", () => ({
    $getSelection: () => mockGetSelection(),
    $isRangeSelection: (sel: unknown) => mockIsRangeSelection(sel),
    FORMAT_TEXT_COMMAND: "FORMAT_TEXT_COMMAND",
}));

const mockSetBlocksType = jest
    .fn()
    .mockImplementation((_sel: unknown, factory: () => unknown) => factory());

jest.mock("@lexical/selection", () => ({
    $setBlocksType: (...args: unknown[]) =>
        mockSetBlocksType(...(args as [unknown, () => unknown])),
}));

const mockIsHeadingNode = jest.fn().mockReturnValue(false);
const mockCreateHeadingNode = jest.fn().mockReturnValue({});
const mockCreateQuoteNode = jest.fn().mockReturnValue({});

jest.mock("@lexical/rich-text", () => ({
    $isHeadingNode: (node: unknown) => mockIsHeadingNode(node),
    $createHeadingNode: (tag: string) => mockCreateHeadingNode(tag),
    $createQuoteNode: () => mockCreateQuoteNode(),
}));

const mockIsListNode = jest.fn().mockReturnValue(false);

jest.mock("@lexical/list", () => ({
    $isListNode: (node: unknown) => mockIsListNode(node),
    INSERT_UNORDERED_LIST_COMMAND: "INSERT_UNORDERED_LIST_COMMAND",
    INSERT_ORDERED_LIST_COMMAND: "INSERT_ORDERED_LIST_COMMAND",
}));

const mockCreateCodeNode = jest.fn().mockReturnValue({});

jest.mock("@lexical/code", () => ({
    $createCodeNode: () => mockCreateCodeNode(),
}));

jest.mock("@lexical/link", () => ({
    TOGGLE_LINK_COMMAND: "TOGGLE_LINK_COMMAND",
}));

import { MarkdownFormattingToolbar } from "@/components/notes/markdown-editor/MarkdownFormattingToolbar";

type MockElement = {
    getKey: () => string;
    getTopLevelElementOrThrow: () => MockElement;
    getTag: () => string;
    getListType: () => string;
    getType: () => string;
};

function fireUpdateListener({
    anchorKey = "1",
    isHeading = false,
    headingTag = "h1",
    isList = false,
    listType = "bullet",
    nodeType = "paragraph",
    bold = false,
    italic = false,
}: {
    anchorKey?: string;
    isHeading?: boolean;
    headingTag?: string;
    isList?: boolean;
    listType?: string;
    nodeType?: string;
    bold?: boolean;
    italic?: boolean;
} = {}) {
    const element: MockElement = {
        getKey: () => anchorKey,
        getTopLevelElementOrThrow: () => element,
        getTag: () => headingTag,
        getListType: () => listType,
        getType: () => nodeType,
    };

    const anchorNode =
        anchorKey === "root"
            ? element
            : { getKey: () => anchorKey, getTopLevelElementOrThrow: () => element };

    const mockSelection = {
        anchor: { getNode: () => anchorNode },
        hasFormat: (fmt: string) => {
            if (fmt === "bold") return bold;
            if (fmt === "italic") return italic;
            return false;
        },
    };

    mockGetSelection.mockReturnValue(mockSelection);
    mockIsRangeSelection.mockReturnValue(true);
    mockIsHeadingNode.mockReturnValue(isHeading);
    mockIsListNode.mockReturnValue(isList);

    const mockEditorState = { read: (fn: () => void) => fn() };
    act(() => {
        capturedListener?.({ editorState: mockEditorState });
    });
}

describe("MarkdownFormattingToolbar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedListener = null;
        mockGetSelection.mockReturnValue(null);
        mockIsRangeSelection.mockReturnValue(false);
        mockIsHeadingNode.mockReturnValue(false);
        mockIsListNode.mockReturnValue(false);
        mockUpdate.mockImplementation((fn: () => void) => fn());
        mockSetBlocksType.mockImplementation((_sel: unknown, factory: () => unknown) =>
            factory(),
        );
    });

    it("renders all 9 formatting buttons", () => {
        render(<MarkdownFormattingToolbar />);
        expect(screen.getByLabelText("editor.format.bold")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.italic")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.h1")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.h2")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.bulletList")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.numberedList")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.link")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.blockquote")).toBeInTheDocument();
        expect(screen.getByLabelText("editor.format.codeBlock")).toBeInTheDocument();
    });

    it("registers an update listener on mount and cleans it up on unmount", () => {
        const { unmount } = render(<MarkdownFormattingToolbar />);
        expect(mockRegisterUpdateListener).toHaveBeenCalledTimes(1);
        expect(capturedListener).not.toBeNull();
        unmount();
        expect(capturedListener).toBeNull();
    });

    it("resets format state when selection is not a RangeSelection", () => {
        render(<MarkdownFormattingToolbar />);
        mockGetSelection.mockReturnValue(null);
        mockIsRangeSelection.mockReturnValue(false);
        const mockEditorState = { read: (fn: () => void) => fn() };
        act(() => {
            capturedListener?.({ editorState: mockEditorState });
        });
        expect(screen.getByLabelText("editor.format.bold")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets h1 active when selection is on an h1 heading", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ isHeading: true, headingTag: "h1" });
        expect(screen.getByLabelText("editor.format.h1")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByLabelText("editor.format.h2")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets h2 active when selection is on an h2 heading", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ isHeading: true, headingTag: "h2" });
        expect(screen.getByLabelText("editor.format.h2")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByLabelText("editor.format.h1")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets bulletList active when selection is in a bullet list", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ isList: true, listType: "bullet" });
        expect(screen.getByLabelText("editor.format.bulletList")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByLabelText("editor.format.numberedList")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets orderedList active when selection is in a numbered list", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ isList: true, listType: "number" });
        expect(screen.getByLabelText("editor.format.numberedList")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByLabelText("editor.format.bulletList")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets quote active when selection is in a blockquote", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ nodeType: "quote" });
        expect(screen.getByLabelText("editor.format.blockquote")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("sets code active when selection is in a code block", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ nodeType: "code" });
        expect(screen.getByLabelText("editor.format.codeBlock")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("leaves all block formats false for a paragraph node", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ nodeType: "paragraph" });
        expect(screen.getByLabelText("editor.format.blockquote")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
        expect(screen.getByLabelText("editor.format.codeBlock")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("handles root anchor node without throwing", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ anchorKey: "root" });
        expect(screen.getByLabelText("editor.format.bold")).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });

    it("sets bold active when selection has bold format", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ bold: true });
        expect(screen.getByLabelText("editor.format.bold")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("sets italic active when selection has italic format", () => {
        render(<MarkdownFormattingToolbar />);
        fireUpdateListener({ italic: true });
        expect(screen.getByLabelText("editor.format.italic")).toHaveAttribute(
            "aria-pressed",
            "true",
        );
    });

    it("dispatches bold command when Bold button is clicked", () => {
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.bold"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("FORMAT_TEXT_COMMAND", "bold");
    });

    it("dispatches italic command when Italic button is clicked", () => {
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.italic"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "FORMAT_TEXT_COMMAND",
            "italic",
        );
    });

    it("calls $setBlocksType with h1 heading factory when Heading 1 is clicked with range selection", () => {
        mockIsRangeSelection.mockReturnValue(true);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.h1"));
        expect(mockSetBlocksType).toHaveBeenCalled();
        expect(mockCreateHeadingNode).toHaveBeenCalledWith("h1");
    });

    it("skips $setBlocksType for Heading 1 when no range selection", () => {
        mockIsRangeSelection.mockReturnValue(false);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.h1"));
        expect(mockSetBlocksType).not.toHaveBeenCalled();
    });

    it("calls $setBlocksType with h2 heading factory when Heading 2 is clicked", () => {
        mockIsRangeSelection.mockReturnValue(true);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.h2"));
        expect(mockCreateHeadingNode).toHaveBeenCalledWith("h2");
    });

    it("dispatches INSERT_UNORDERED_LIST_COMMAND when Bullet list is clicked", () => {
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.bulletList"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "INSERT_UNORDERED_LIST_COMMAND",
            undefined,
        );
    });

    it("dispatches INSERT_ORDERED_LIST_COMMAND when Numbered list is clicked", () => {
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.numberedList"));
        expect(mockDispatchCommand).toHaveBeenCalledWith(
            "INSERT_ORDERED_LIST_COMMAND",
            undefined,
        );
    });

    it("dispatches TOGGLE_LINK_COMMAND with url when user enters a URL", () => {
        jest.spyOn(window, "prompt").mockReturnValue("https://example.com");
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.link"));
        expect(mockDispatchCommand).toHaveBeenCalledWith("TOGGLE_LINK_COMMAND", {
            url: "https://example.com",
        });
    });

    it("does not dispatch TOGGLE_LINK_COMMAND when user cancels the URL prompt", () => {
        jest.spyOn(window, "prompt").mockReturnValue(null);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.link"));
        expect(mockDispatchCommand).not.toHaveBeenCalled();
    });

    it("calls $setBlocksType with quote factory when Blockquote is clicked with range selection", () => {
        mockIsRangeSelection.mockReturnValue(true);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.blockquote"));
        expect(mockSetBlocksType).toHaveBeenCalled();
        expect(mockCreateQuoteNode).toHaveBeenCalled();
    });

    it("skips $setBlocksType for Blockquote when no range selection", () => {
        mockIsRangeSelection.mockReturnValue(false);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.blockquote"));
        expect(mockSetBlocksType).not.toHaveBeenCalled();
    });

    it("calls $setBlocksType with code factory when Code block is clicked with range selection", () => {
        mockIsRangeSelection.mockReturnValue(true);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.codeBlock"));
        expect(mockSetBlocksType).toHaveBeenCalled();
        expect(mockCreateCodeNode).toHaveBeenCalled();
    });

    it("skips $setBlocksType for Code block when no range selection", () => {
        mockIsRangeSelection.mockReturnValue(false);
        render(<MarkdownFormattingToolbar />);
        fireEvent.click(screen.getByLabelText("editor.format.codeBlock"));
        expect(mockSetBlocksType).not.toHaveBeenCalled();
    });
});
