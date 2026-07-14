import { render, screen } from "@testing-library/react";
import { ClientDashboardHome } from "@/pages/dashboard/ClientDashboardHome";
import { useAuthStore } from "@/stores/authStore";
import { useRecentNotes } from "@/hooks/useRecentNotes";

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useRecentNotes");
jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
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
});
