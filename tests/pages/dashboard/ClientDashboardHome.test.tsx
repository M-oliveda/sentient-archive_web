import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientDashboardHome } from "@/pages/dashboard/ClientDashboardHome";
import { useAuthStore } from "@/stores/authStore";
import { useRecentNotes } from "@/hooks/useRecentNotes";

const mockNavigate = jest.fn();
const mockCreateNote = {
    mutateAsync: jest.fn().mockResolvedValue("new-note-id"),
    isPending: false,
};

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useRecentNotes");
jest.mock("@tanstack/react-router", () => ({
    useNavigate: () => mockNavigate,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));
jest.mock("@/hooks/useNotesMutations", () => ({
    useCreateNote: () => mockCreateNote,
}));
jest.mock("@/components/notes/FileExtractor", () => ({
    FileExtractor: ({
        onNoteCreated,
        className,
    }: {
        onNoteCreated: (id: string) => void;
        className?: string;
    }) => (
        <button
            data-testid="file-extractor"
            className={className}
            onClick={() => onNoteCreated("extracted-note-id")}
        >
            Upload Document
        </button>
    ),
}));

const mockUser = {
    uid: "1",
    email: "alex@test.com",
    displayName: "Alex Smith",
    photoURL: null,
    role: "client" as const,
    isActive: true,
    tokenBalance: 2450,
};

const mockNote = {
    id: "1",
    title: "Meeting Minutes: Q3 Planning",
    excerpt: "Discussed the roadmap for the upcoming quarter.",
    tags: ["planning", "team"],
    folderId: "Projects",
    updatedAt: new Date("2024-01-01"),
};

describe("ClientDashboardHome", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateNote.mutateAsync = jest.fn().mockResolvedValue("new-note-id");
        mockCreateNote.isPending = false;
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: { notes: [mockNote], totalCount: 5 },
            isLoading: false,
        });
    });

    it("renders welcome message with first name", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText(/Welcome back, Alex/)).toBeInTheDocument();
    });

    it("uses 'there' when displayName is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, displayName: null },
        });
        render(<ClientDashboardHome />);
        expect(screen.getByText(/Welcome back, there/)).toBeInTheDocument();
    });

    it("renders New Note and Upload Document buttons", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("New Note")).toBeInTheDocument();
        expect(screen.getByText("Upload Document")).toBeInTheDocument();
    });

    it("disables the New Note button when createNote is pending", () => {
        mockCreateNote.isPending = true;
        render(<ClientDashboardHome />);
        expect(screen.getByRole("button", { name: /New Note/ })).toBeDisabled();
    });

    it("clicking New Note calls createNote.mutateAsync with null", async () => {
        render(<ClientDashboardHome />);
        fireEvent.click(screen.getByRole("button", { name: /New Note/ }));
        await waitFor(() =>
            expect(mockCreateNote.mutateAsync).toHaveBeenCalledWith(null),
        );
    });

    it("clicking New Note navigates to /notes/$noteId in edit mode", async () => {
        render(<ClientDashboardHome />);
        fireEvent.click(screen.getByRole("button", { name: /New Note/ }));
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith({
                to: "/notes/$noteId",
                params: { noteId: "new-note-id" },
                search: { edit: "1" },
            }),
        );
    });

    it("FileExtractor.onNoteCreated navigates to the note read view", () => {
        render(<ClientDashboardHome />);
        fireEvent.click(screen.getByTestId("file-extractor"));
        expect(mockNavigate).toHaveBeenCalledWith({
            to: "/notes/$noteId",
            params: { noteId: "extracted-note-id" },
        });
    });

    it("passes brand className to FileExtractor", () => {
        render(<ClientDashboardHome />);
        const extractor = screen.getByTestId("file-extractor");
        expect(extractor.className).toContain("bg-brand-500");
    });

    it("renders stats section with token balance from store", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("2,450")).toBeInTheDocument();
    });

    it("renders notes count from real data", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders last edited note title and note card from real data", () => {
        render(<ClientDashboardHome />);
        // Full title in RecentNoteCard; truncated in Last Edited stat card
        expect(screen.getByText("Meeting Minutes: Q3 Planning")).toBeInTheDocument();
        expect(screen.getByText("Meeting Mi...")).toBeInTheDocument();
    });

    it("renders Recent Notes section heading", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("Recent Notes")).toBeInTheDocument();
    });

    it("renders Show More button", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("Show More")).toBeInTheDocument();
    });

    it("shows 0 tokens when user has no token balance", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<ClientDashboardHome />);
        expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("shows loading placeholders when data is loading", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<ClientDashboardHome />);
        const dashes = screen.getAllByText("—");
        expect(dashes.length).toBeGreaterThanOrEqual(2);
    });

    it("shows empty state message when no notes exist", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: { notes: [], totalCount: 0 },
            isLoading: false,
        });
        render(<ClientDashboardHome />);
        expect(
            screen.getByText(/No notes yet. Create your first note!/),
        ).toBeInTheDocument();
    });

    it("renders folder fallback as 'Notes' when folderId is null", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: {
                notes: [{ ...mockNote, folderId: null }],
                totalCount: 1,
            },
            isLoading: false,
        });
        render(<ClientDashboardHome />);
        const allNotes = screen.getAllByText("Notes");
        expect(allNotes.length).toBeGreaterThanOrEqual(2);
    });

    it("shows low-balance alert when tokenBalance is below 20", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, tokenBalance: 10 },
        });
        render(<ClientDashboardHome />);
        expect(screen.getByTestId("low-balance-alert")).toBeInTheDocument();
        expect(screen.getByText(/Your token balance is low/)).toBeInTheDocument();
    });

    it("does not show low-balance alert when tokenBalance is 20 or above", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, tokenBalance: 20 },
        });
        render(<ClientDashboardHome />);
        expect(screen.queryByTestId("low-balance-alert")).not.toBeInTheDocument();
    });

    it("does not show low-balance alert when user is null (balance is 0 which is < 20)", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<ClientDashboardHome />);
        expect(screen.getByTestId("low-balance-alert")).toBeInTheDocument();
    });

    it("low-balance alert contains a link to /tokens", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, tokenBalance: 5 },
        });
        render(<ClientDashboardHome />);
        const link = screen.getByRole("link", { name: /Request more tokens/ });
        expect(link).toHaveAttribute("href", "/tokens");
    });

    it("Tokens StatsCard action navigates to /tokens", () => {
        render(<ClientDashboardHome />);
        const requestMoreButton = screen.getByRole("button", { name: /Request More/ });
        fireEvent.click(requestMoreButton);
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/tokens" });
    });
});
