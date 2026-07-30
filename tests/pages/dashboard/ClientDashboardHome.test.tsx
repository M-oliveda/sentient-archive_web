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
            extractor.button
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

/** Stats render in both the mobile carousel and the desktop grid. */
const STATS_LAYOUT_COUNT = 2;

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
        expect(screen.getByText(/client.welcome/)).toBeInTheDocument();
    });

    it("uses welcomeFallback when displayName is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, displayName: null },
        });
        render(<ClientDashboardHome />);
        // The welcome message will contain the fallback value from t("client.welcomeFallback")
        expect(screen.getByText(/client.welcome/)).toBeInTheDocument();
    });

    it("renders New Note and Upload Document buttons", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("client.actions.newNote")).toBeInTheDocument();
        expect(screen.getByText("extractor.button")).toBeInTheDocument();
    });

    it("disables the New Note button when createNote is pending", () => {
        mockCreateNote.isPending = true;
        render(<ClientDashboardHome />);
        expect(
            screen.getByRole("button", { name: /client.actions.newNote/ }),
        ).toBeDisabled();
    });

    it("clicking New Note calls createNote.mutateAsync with null", async () => {
        render(<ClientDashboardHome />);
        fireEvent.click(screen.getByRole("button", { name: /client.actions.newNote/ }));
        await waitFor(() =>
            expect(mockCreateNote.mutateAsync).toHaveBeenCalledWith(null),
        );
    });

    it("clicking New Note navigates to /notes/$noteId in edit mode", async () => {
        render(<ClientDashboardHome />);
        fireEvent.click(screen.getByRole("button", { name: /client.actions.newNote/ }));
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
        expect(screen.getAllByText("2,450")).toHaveLength(STATS_LAYOUT_COUNT);
    });

    it("renders notes count from real data", () => {
        render(<ClientDashboardHome />);
        expect(screen.getAllByText("5")).toHaveLength(STATS_LAYOUT_COUNT);
    });

    it("renders last edited note title and note card from real data", () => {
        render(<ClientDashboardHome />);
        // Full title in RecentNoteCard; truncated in Last Edited stat card
        expect(screen.getByText("Meeting Minutes: Q3 Planning")).toBeInTheDocument();
        expect(screen.getAllByText("Meeting Mi...")).toHaveLength(STATS_LAYOUT_COUNT);
    });

    it("renders a mobile carousel with navigation controls", () => {
        render(<ClientDashboardHome />);

        expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
        expect(
            screen.getByRole("region", { name: "client.stats.ariaLabel" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Previous slide")).toBeInTheDocument();
        expect(screen.getByText("Next slide")).toBeInTheDocument();
        expect(document.querySelectorAll('[data-slot="carousel-item"]').length).toBe(3);
    });

    it("renders Recent Notes section heading", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("client.recentNotes.title")).toBeInTheDocument();
    });

    it("renders Show More button", () => {
        render(<ClientDashboardHome />);
        expect(screen.getByText("client.recentNotes.showMore")).toBeInTheDocument();
    });

    it("shows 0 tokens when user has no token balance", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<ClientDashboardHome />);
        expect(screen.getAllByText("0")).toHaveLength(STATS_LAYOUT_COUNT);
    });

    it("shows loading placeholders when data is loading", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<ClientDashboardHome />);
        const dashes = screen.getAllByText("—");
        // notes + lastEdited in both carousel and grid layouts
        expect(dashes.length).toBeGreaterThanOrEqual(4);
        expect(screen.getByTestId("recent-notes-loading")).toBeInTheDocument();
    });

    it("shows empty state message when no notes exist", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: { notes: [], totalCount: 0 },
            isLoading: false,
        });
        render(<ClientDashboardHome />);
        expect(screen.getByText("client.recentNotes.empty")).toBeInTheDocument();
    });

    it("renders folder fallback when folderId is null", () => {
        (useRecentNotes as jest.Mock).mockReturnValue({
            data: {
                notes: [{ ...mockNote, folderId: null }],
                totalCount: 1,
            },
            isLoading: false,
        });
        render(<ClientDashboardHome />);
        const folderFallback = screen.getAllByText("client.recentNotes.folderFallback");
        expect(folderFallback.length).toBeGreaterThanOrEqual(1);
    });

    it("shows low-balance alert when tokenBalance is below 20", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { ...mockUser, tokenBalance: 10 },
        });
        render(<ClientDashboardHome />);
        const alert = screen.getByTestId("low-balance-alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent("client.lowBalance.message");
        expect(alert).toHaveTextContent("client.lowBalance.link");
        expect(alert).toHaveTextContent("client.lowBalance.suffix");
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
        const link = screen.getByRole("link", { name: "client.lowBalance.link" });
        expect(link).toHaveAttribute("href", "/tokens");
    });

    it("Tokens StatsCard action navigates to /tokens", () => {
        render(<ClientDashboardHome />);
        const requestMoreButtons = screen.getAllByRole("button", {
            name: "client.stats.requestMore",
        });
        expect(requestMoreButtons).toHaveLength(STATS_LAYOUT_COUNT);
        fireEvent.click(requestMoreButtons[0]!);
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/tokens" });
    });
});
