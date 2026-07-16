import type React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/alert-dialog", () => ({
    AlertDialog: ({
        children,
        open,
    }: {
        children: React.ReactNode;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }) => (open ? <>{children}</> : null),
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
        <div role="dialog">{children}</div>
    ),
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
        <h2>{children}</h2>
    ),
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
        <p>{children}</p>
    ),
    AlertDialogMedia: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AlertDialogAction: ({
        children,
        onClick,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        variant?: string;
    }) => <button onClick={onClick}>{children}</button>,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
        <button>{children}</button>
    ),
}));

import { EditorToolbar } from "@/components/notes/markdown-editor/EditorToolbar";

describe("EditorToolbar", () => {
    const BASE = {
        title: "My Note",
        saveStatus: "idle" as const,
        onTitleChange: jest.fn(),
        onDelete: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    it("renders the note title in the input", () => {
        render(<EditorToolbar {...BASE} />);
        expect(screen.getByDisplayValue("My Note")).toBeInTheDocument();
    });

    it("calls onTitleChange when the title input changes", () => {
        render(<EditorToolbar {...BASE} />);
        fireEvent.change(screen.getByLabelText("Note title"), {
            target: { value: "Updated Title" },
        });
        expect(BASE.onTitleChange).toHaveBeenCalledWith("Updated Title");
    });

    it("opens the delete confirmation dialog when the delete button is clicked", () => {
        render(<EditorToolbar {...BASE} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByLabelText("Delete note"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("calls onDelete when deletion is confirmed in the dialog", () => {
        render(<EditorToolbar {...BASE} />);
        fireEvent.click(screen.getByLabelText("Delete note"));
        fireEvent.click(screen.getByRole("button", { name: "Delete" }));
        expect(BASE.onDelete).toHaveBeenCalledTimes(1);
    });

    it("hides the save status indicator when status is idle", () => {
        render(<EditorToolbar {...BASE} saveStatus="idle" />);
        expect(screen.queryByText("Saving")).not.toBeInTheDocument();
        expect(screen.queryByText("Saved")).not.toBeInTheDocument();
    });

    it("shows 'Saving' text when saveStatus is saving", () => {
        render(<EditorToolbar {...BASE} saveStatus="saving" />);
        expect(screen.getByText("Saving")).toBeInTheDocument();
    });

    it("shows 'Saved' text when saveStatus is saved", () => {
        render(<EditorToolbar {...BASE} saveStatus="saved" />);
        expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    it("does not render back button when onBack is not provided", () => {
        render(<EditorToolbar {...BASE} />);
        expect(screen.queryByLabelText("Back")).not.toBeInTheDocument();
    });

    it("renders back button when onBack is provided", () => {
        render(<EditorToolbar {...BASE} onBack={jest.fn()} />);
        expect(screen.getByLabelText("Back")).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", () => {
        const onBack = jest.fn();
        render(<EditorToolbar {...BASE} onBack={onBack} />);
        fireEvent.click(screen.getByLabelText("Back"));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("does not render Toggle AI Tools button when onToggleAI is not provided", () => {
        render(<EditorToolbar {...BASE} />);
        expect(screen.queryByLabelText("Toggle AI Tools")).not.toBeInTheDocument();
    });

    it("renders Toggle AI Tools button when onToggleAI is provided", () => {
        render(<EditorToolbar {...BASE} onToggleAI={jest.fn()} />);
        expect(screen.getByLabelText("Toggle AI Tools")).toBeInTheDocument();
    });

    it("calls onToggleAI when the Toggle AI Tools button is clicked", () => {
        const onToggleAI = jest.fn();
        render(<EditorToolbar {...BASE} onToggleAI={onToggleAI} />);
        fireEvent.click(screen.getByLabelText("Toggle AI Tools"));
        expect(onToggleAI).toHaveBeenCalledTimes(1);
    });
});
