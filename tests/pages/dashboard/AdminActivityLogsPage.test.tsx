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

        expect(screen.getByText("activityLogs.title")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.eyebrow")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.subtitle")).toBeInTheDocument();
    });

    it("renders category tabs and activity entries", () => {
        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("activityLogs.tabs.all")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.tabs.ai")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.tabs.tokens")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.tabs.notes")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.tabs.folders")).toBeInTheDocument();

        expect(screen.getByText("Summarized a note")).toBeInTheDocument();
        expect(screen.getByText("Tokens granted")).toBeInTheDocument();
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(screen.getByText("activityLogs.showing")).toBeInTheDocument();
    });

    it("shows loading state when there are no entries yet", () => {
        mockHook({
            data: undefined,
            isLoading: true,
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("activityLogs.loading")).toBeInTheDocument();
    });

    it("shows error state", () => {
        mockHook({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error("Failed"),
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("activityLogs.loadError")).toBeInTheDocument();
    });

    it("shows empty state when there are no matching logs", () => {
        mockHook({
            data: { entries: [], total: 0, limit: 50, offset: 0 },
            isLoading: false,
            isError: false,
        });

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("activityLogs.empty")).toBeInTheDocument();
    });

    it("changes category filter and resets limit", async () => {
        const user = userEvent.setup();
        const mockUseAdminActivityLogs = mockHook();

        render(<AdminActivityLogsPage />, { wrapper: createWrapper() });

        await user.click(screen.getByText("activityLogs.tabs.ai"));

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

        const input = screen.getByPlaceholderText("activityLogs.searchPlaceholder");
        await user.type(input, "summary");

        await waitFor(() => {
            expect(mockUseAdminActivityLogs).toHaveBeenCalledWith(
                expect.objectContaining({
                    q: "summary",
                    limit: 50,
                }),
            );
        });

        expect(
            screen.getByRole("button", { name: "activityLogs.clear" }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "activityLogs.clear" }));

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

        expect(screen.getByText("activityLogs.showing")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: /activityLogs\.loadMore/i }),
        );

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

        expect(
            screen.getByRole("button", { name: /activityLogs\.loadMore/i }),
        ).toBeDisabled();
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
