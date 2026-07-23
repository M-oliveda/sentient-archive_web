import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminTokenRequestsPage } from "@/pages/dashboard/AdminTokenRequestsPage";
import * as useTokenRequestsHook from "@/hooks/useTokenRequests";
import type { ITokenRequest } from "@/types/admin";

jest.mock("@/hooks/useTokenRequests");
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockUseTokenRequests =
    useTokenRequestsHook.useTokenRequests as jest.MockedFunction<
        typeof useTokenRequestsHook.useTokenRequests
    >;
const mockUseApproveTokenRequest =
    useTokenRequestsHook.useApproveTokenRequest as jest.MockedFunction<
        typeof useTokenRequestsHook.useApproveTokenRequest
    >;
const mockUseRejectTokenRequest =
    useTokenRequestsHook.useRejectTokenRequest as jest.MockedFunction<
        typeof useTokenRequestsHook.useRejectTokenRequest
    >;

const createWrapper = () => {
    const queryClient = new QueryClient();

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
};

const mockRequests: ITokenRequest[] = [
    {
        id: "req1",
        userId: "user1",
        amount: 50000,
        status: "pending",
        createdAt: "2026-07-22T00:00:00Z",
        userEmail: "alice.c@sentient.ai",
        userName: "Alice Chen",
        currentBalance: 0,
        justification: "Critical: running large embeddings.",
        lastGrantAt: "2026-07-08T00:00:00Z",
        isUrgent: true,
    },
    {
        id: "req2",
        userId: "user2",
        amount: 100,
        status: "pending",
        createdAt: "2026-07-22T00:00:00Z",
        userEmail: "bob@sentient.ai",
        userName: "Bob Smith",
        currentBalance: 200,
        isUrgent: false,
    },
];

const setupMocks = (
    overrides: Partial<ReturnType<typeof useTokenRequestsHook.useTokenRequests>> = {},
) => {
    mockUseTokenRequests.mockReturnValue({
        data: { requests: mockRequests, total: 2, limit: 25, offset: 0 },
        isLoading: false,
        isError: false,
        error: null,
        ...overrides,
    } as unknown as ReturnType<typeof useTokenRequestsHook.useTokenRequests>);

    mockUseApproveTokenRequest.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn().mockResolvedValue({}),
        isPending: false,
    } as unknown as ReturnType<typeof useTokenRequestsHook.useApproveTokenRequest>);

    mockUseRejectTokenRequest.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn().mockResolvedValue({}),
        isPending: false,
    } as unknown as ReturnType<typeof useTokenRequestsHook.useRejectTokenRequest>);
};

describe("AdminTokenRequestsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders page title and description", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Token Requests")).toBeInTheDocument();
        expect(screen.queryByText(/Review and approve/)).not.toBeInTheDocument();
    });

    it("renders status tabs", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Approved")).toBeInTheDocument();
        expect(screen.getByText("Denied")).toBeInTheDocument();
        expect(screen.getByText("All History")).toBeInTheDocument();
    });

    it("defaults to the pending tab and shows pending/urgent stats", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        const pendingTab = screen.getByRole("button", { name: /Pending/ });
        expect(pendingTab).toHaveClass("bg-primary");
        expect(screen.getByText("1 Urgent (Low Balance)")).toBeInTheDocument();
    });

    it("switches tabs and refetches with the new status filter", async () => {
        mockUseTokenRequests.mockImplementation((params) => {
            const isPending = params?.status === "pending";
            return {
                data: {
                    requests: isPending ? mockRequests : [],
                    total: isPending ? 2 : 0,
                    limit: 25,
                    offset: 0,
                },
                isLoading: false,
                isError: false,
                error: null,
            } as unknown as ReturnType<typeof useTokenRequestsHook.useTokenRequests>;
        });

        mockUseApproveTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockResolvedValue({}),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useApproveTokenRequest>);

        mockUseRejectTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockResolvedValue({}),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useRejectTokenRequest>);

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("1 Urgent (Low Balance)")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Approved"));

        await waitFor(() => {
            expect(mockUseTokenRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({ status: "approved", offset: 0, limit: 25 }),
            );
        });

        // Urgent count is derived from the current response; approved has none
        expect(screen.queryByText(/Urgent \(Low Balance\)/)).not.toBeInTheDocument();
    });

    it("renders token request cards", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Alice Chen")).toBeInTheDocument();
        expect(screen.getByText("alice.c@sentient.ai")).toBeInTheDocument();
        expect(screen.getByText("50k TKN")).toBeInTheDocument();
    });

    it("displays approve/reject buttons for pending requests", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        const approveButtons = screen.getAllByText("Approve");
        const rejectButtons = screen.getAllByText("Reject");
        expect(approveButtons.length).toBeGreaterThan(0);
        expect(rejectButtons.length).toBeGreaterThan(0);
    });

    it("opens the approve modal, submits, and shows a success toast", async () => {
        setupMocks();
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Approve")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });

        const dialog = screen.getByRole("dialog");
        const amountInput = within(dialog).getByRole("spinbutton");
        await userEvent.clear(amountInput);
        await userEvent.type(amountInput, "750");

        const notesInput = within(dialog).getByPlaceholderText("Approval notes...");
        await userEvent.type(notesInput, "Looks good");

        await userEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

        await waitFor(() => {
            expect(mockUseApproveTokenRequest().mutateAsync).toHaveBeenCalledWith({
                requestId: "req1",
                payload: { amount: 750, notes: "Looks good" },
            });
            expect(toast.success).toHaveBeenCalledWith("Token request approved");
        });
    });

    it("approves with empty amount and notes as undefined", async () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Approve")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });

        const dialog = screen.getByRole("dialog");
        await userEvent.clear(within(dialog).getByRole("spinbutton"));
        await userEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

        await waitFor(() => {
            expect(mockUseApproveTokenRequest().mutateAsync).toHaveBeenCalledWith({
                requestId: "req1",
                payload: { amount: undefined, notes: undefined },
            });
        });
    });

    it("shows Approving... while approve mutation is pending", async () => {
        setupMocks();
        const pendingState = { isPending: false };
        mockUseApproveTokenRequest.mockImplementation(
            () =>
                ({
                    mutate: jest.fn(),
                    mutateAsync: jest.fn(),
                    get isPending() {
                        return pendingState.isPending;
                    },
                }) as unknown as ReturnType<
                    typeof useTokenRequestsHook.useApproveTokenRequest
                >,
        );

        const queryClient = new QueryClient();
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <AdminTokenRequestsPage />
            </QueryClientProvider>,
        );

        await userEvent.click(screen.getAllByText("Approve")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });

        pendingState.isPending = true;
        rerender(
            <QueryClientProvider client={queryClient}>
                <AdminTokenRequestsPage />
            </QueryClientProvider>,
        );

        expect(screen.getByText("Approving...")).toBeInTheDocument();
    });

    it("shows Rejecting... while reject mutation is pending", async () => {
        setupMocks();
        const pendingState = { isPending: false };
        mockUseRejectTokenRequest.mockImplementation(
            () =>
                ({
                    mutate: jest.fn(),
                    mutateAsync: jest.fn(),
                    get isPending() {
                        return pendingState.isPending;
                    },
                }) as unknown as ReturnType<
                    typeof useTokenRequestsHook.useRejectTokenRequest
                >,
        );

        const queryClient = new QueryClient();
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <AdminTokenRequestsPage />
            </QueryClientProvider>,
        );

        await userEvent.click(screen.getAllByText("Reject")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });

        pendingState.isPending = true;
        rerender(
            <QueryClientProvider client={queryClient}>
                <AdminTokenRequestsPage />
            </QueryClientProvider>,
        );

        expect(screen.getByText("Rejecting...")).toBeInTheDocument();
    });

    it("shows generic error toast when approve fails with non-Error", async () => {
        setupMocks();
        mockUseApproveTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockRejectedValue("boom"),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useApproveTokenRequest>);
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Approve")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });
        await userEvent.click(
            within(screen.getByRole("dialog")).getByRole("button", { name: "Approve" }),
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to approve request");
        });
    });

    it("shows generic error toast when reject fails with non-Error", async () => {
        setupMocks();
        mockUseRejectTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockRejectedValue("boom"),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useRejectTokenRequest>);
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Reject")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });
        await userEvent.click(
            within(screen.getByRole("dialog")).getByRole("button", { name: "Reject" }),
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to reject request");
        });
    });

    it("renders empty list when response data is undefined and not loading", () => {
        setupMocks({ data: undefined, isLoading: false });

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText(/No token requests found/)).toBeInTheDocument();
    });

    it("renders error state when the query fails", () => {
        setupMocks({ data: undefined, isLoading: false, isError: true });

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText(/Failed to load token requests/)).toBeInTheDocument();
        expect(screen.queryByText(/No token requests found/)).not.toBeInTheDocument();
    });

    it("updates reject reason input before submitting", async () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Reject")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });

        const dialog = screen.getByRole("dialog");
        await userEvent.type(
            within(dialog).getByPlaceholderText("Rejection reason..."),
            "Not justified",
        );
        await userEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

        await waitFor(() => {
            expect(mockUseRejectTokenRequest().mutateAsync).toHaveBeenCalledWith({
                requestId: "req1",
                payload: { reason: "Not justified" },
            });
        });
    });

    it("shows an error toast when approving fails", async () => {
        setupMocks();
        mockUseApproveTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockRejectedValue(new Error("Network error")),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useApproveTokenRequest>);
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Approve")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });
        const dialog = screen.getByRole("dialog");
        await userEvent.click(within(dialog).getByRole("button", { name: "Approve" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Network error");
        });
    });

    it("opens the reject modal, submits, and shows a success toast", async () => {
        setupMocks();
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Reject")[0]!);

        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });

        const dialog = screen.getByRole("dialog");
        await userEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

        await waitFor(() => {
            expect(mockUseRejectTokenRequest().mutateAsync).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("Token request rejected");
        });
    });

    it("shows an error toast when rejecting fails", async () => {
        setupMocks();
        mockUseRejectTokenRequest.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync: jest.fn().mockRejectedValue(new Error("Network error")),
            isPending: false,
        } as unknown as ReturnType<typeof useTokenRequestsHook.useRejectTokenRequest>);
        const { toast } = jest.requireMock("sonner");

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Reject")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });
        const dialog = screen.getByRole("dialog");
        await userEvent.click(within(dialog).getByRole("button", { name: "Reject" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Network error");
        });
    });

    it("cancels the approve and reject modals", async () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        await userEvent.click(screen.getAllByText("Approve")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Approve Token Request")).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => {
            expect(screen.queryByText("Approve Token Request")).not.toBeInTheDocument();
        });

        await userEvent.click(screen.getAllByText("Reject")[0]!);
        await waitFor(() => {
            expect(screen.getByText("Reject Token Request")).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => {
            expect(screen.queryByText("Reject Token Request")).not.toBeInTheDocument();
        });
    });

    it("shows a load more button when there are more results and loads more on click", async () => {
        setupMocks({
            data: { requests: mockRequests, total: 5, limit: 2, offset: 0 },
        });

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        const loadMoreButton = screen.getByText("Load More");
        expect(loadMoreButton).toBeInTheDocument();

        await userEvent.click(loadMoreButton);

        await waitFor(() => {
            expect(mockUseTokenRequests).toHaveBeenLastCalledWith(
                expect.objectContaining({ limit: 50 }),
            );
        });
    });

    it("does not show a load more button when all results are loaded", () => {
        setupMocks();

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
    });

    it("shows loading state", () => {
        setupMocks({ data: undefined, isLoading: true });

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Loading token requests...")).toBeInTheDocument();
    });

    it("shows empty state when no requests", () => {
        setupMocks({ data: { requests: [], total: 0, limit: 25, offset: 0 } });

        render(<AdminTokenRequestsPage />, { wrapper: createWrapper() });

        expect(screen.getByText(/No token requests found/)).toBeInTheDocument();
    });
});
