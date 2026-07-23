import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { AdminActivityLogsPage } from "@/pages/dashboard/AdminActivityLogsPage";
import * as useAdminActivityLogsModule from "@/hooks/useAdminActivityLogs";
import type { AdminActivityLogsResponse } from "@/hooks/useAdminActivityLogs";
import type { IAdminActivityEntry } from "@/types/admin";

jest.mock("@/hooks/useAdminActivityLogs", () => ({
    ...jest.requireActual("@/hooks/useAdminActivityLogs"),
    useAdminActivityLogs: jest.fn(),
}));

const mockEntries: IAdminActivityEntry[] = [
    {
        id: "1",
        category: "ai",
        title: "Summarized a note",
        description: "Generated a summary for Note A",
        createdAt: "2026-07-22T12:00:00.000Z",
        iconHint: "bot",
        userId: "user-1",
        userEmail: "user@example.com",
        userName: "Test User",
    },
    {
        id: "2",
        category: "tokens",
        title: "Tokens granted",
        description: "Admin granted tokens",
        createdAt: "2026-07-22T11:00:00.000Z",
        iconHint: "coins",
        userId: "user-2",
        userEmail: "admin@example.com",
    },
    {
        id: "3",
        category: "notes",
        title: "Note created",
        description: "Created a new note",
        createdAt: "2026-07-22T10:00:00.000Z",
        iconHint: "file-text",
        userId: "user-3",
        userEmail: "writer@example.com",
        userName: "Writer",
    },
    {
        id: "4",
        category: "folders",
        title: "Folder updated",
        description: "Renamed a folder",
        createdAt: "2026-07-22T09:00:00.000Z",
        iconHint: "folder",
        userId: "user-4",
        userEmail: "folder@example.com",
    },
    {
        id: "5",
        category: "notes",
        title: "Note edited",
        description: "Edited note content",
        createdAt: "2026-07-22T08:00:00.000Z",
        iconHint: "pencil",
        userId: "user-5",
        userEmail: "editor@example.com",
        userName: "Editor",
    },
];

const createWrapper = () => {
    const queryClient = new QueryClient();

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
};

function mockHook(
    overrides: {
        data?: AdminActivityLogsResponse | undefined;
        isLoading?: boolean;
        isError?: boolean;
        error?: Error | null;
    } = {},
) {
    const mockUseAdminActivityLogs =
        useAdminActivityLogsModule.useAdminActivityLogs as jest.MockedFunction<
            typeof useAdminActivityLogsModule.useAdminActivityLogs
        >;

    mockUseAdminActivityLogs.mockReturnValue({
        data: {
            entries: mockEntries,
            total: mockEntries.length,
            limit: 50,
            offset: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
        ...overrides,
    } as unknown as UseQueryResult<AdminActivityLogsResponse>);

    return mockUseAdminActivityLogs;
}

describe("AdminActivityLogsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHook();
    });

    it("renders page header", () => {
        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Activity Logs")).toBeInTheDocument();
        expect(screen.getByText("System Activity")).toBeInTheDocument();
        expect(
            screen.getByText("Monitor all system activities across all users"),
        ).toBeInTheDocument();
    });

    it("renders category tabs and activity entries", () => {
        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("All Activity")).toBeInTheDocument();
        expect(screen.getByText("AI Operations")).toBeInTheDocument();
        expect(screen.getByText("Tokens")).toBeInTheDocument();
        expect(screen.getByText("Notes")).toBeInTheDocument();
        expect(screen.getByText("Folders")).toBeInTheDocument();

        expect(screen.getByText("Summarized a note")).toBeInTheDocument();
        expect(screen.getByText("Tokens granted")).toBeInTheDocument();
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("Showing 5 of 5 activities")).toBeInTheDocument();
    });

    it("shows loading state when there are no entries yet", () => {
        mockHook({
            data: undefined,
            isLoading: true,
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Loading activity logs...")).toBeInTheDocument();
    });

    it("shows error state", () => {
        mockHook({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error("Failed"),
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(
            screen.getByText("Failed to load activity logs. Please try again."),
        ).toBeInTheDocument();
    });

    it("shows empty state when there are no matching logs", () => {
        mockHook({
            data: { entries: [], total: 0, limit: 50, offset: 0 },
            isLoading: false,
            isError: false,
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(
            screen.getByText("No activity logs found. Try adjusting your filters."),
        ).toBeInTheDocument();
    });

    it("changes category filter and resets limit", async () => {
        const user = userEvent.setup();
        const mockUseAdminActivityLogs = mockHook();

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        await user.click(screen.getByText("AI Operations"));

        await waitFor(() => {
            expect(mockUseAdminActivityLogs).toHaveBeenCalledWith(
                expect.objectContaining({
                    category: "ai",
                    limit: 50,
                    offset: 0,
                }),
            );
        });
    });

    it("updates search and shows clear button", async () => {
        const user = userEvent.setup();
        const mockUseAdminActivityLogs = mockHook();

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        const input = screen.getByPlaceholderText(
            "Search by user email, action, or description...",
        );
        await user.type(input, "summary");

        await waitFor(() => {
            expect(mockUseAdminActivityLogs).toHaveBeenCalledWith(
                expect.objectContaining({
                    q: "summary",
                    limit: 50,
                }),
            );
        });

        expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Clear" }));

        await waitFor(() => {
            expect(mockUseAdminActivityLogs).toHaveBeenCalledWith(
                expect.objectContaining({
                    q: "",
                    limit: 50,
                }),
            );
        });
    });

    it("loads more entries when total exceeds current page size", async () => {
        const user = userEvent.setup();
        const mockUseAdminActivityLogs = mockHook({
            data: {
                entries: mockEntries,
                total: 120,
                limit: 50,
                offset: 0,
            },
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Showing 5 of 120 activities")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /load more/i }));

        await waitFor(() => {
            expect(mockUseAdminActivityLogs).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 100,
                }),
            );
        });
    });

    it("disables Load More and spins icon while loading with existing entries", () => {
        mockHook({
            data: {
                entries: mockEntries,
                total: 120,
                limit: 50,
                offset: 0,
            },
            isLoading: true,
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByRole("button", { name: /load more/i })).toBeDisabled();
    });

    it("falls back to FileText icon and default color for unknown hints", () => {
        mockHook({
            data: {
                entries: [
                    {
                        ...mockEntries[0]!,
                        id: "unknown",
                        iconHint: "unknown" as IAdminActivityEntry["iconHint"],
                        category: "unknown" as IAdminActivityEntry["category"],
                        userName: undefined,
                    },
                ],
                total: 1,
                limit: 50,
                offset: 0,
            },
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Summarized a note")).toBeInTheDocument();
        expect(screen.getByText("user@example.com")).toBeInTheDocument();
        expect(screen.queryByText("Test User")).not.toBeInTheDocument();
    });
});
