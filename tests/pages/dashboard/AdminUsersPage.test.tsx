import type React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminUsersPage } from "@/pages/dashboard/AdminUsersPage";
import { resolvePageOffset } from "@/lib/pagination";
import * as useAdminUsersHook from "@/hooks/useAdminUsers";
import { toast } from "sonner";
import type { IAdminUser } from "@/types/admin";

jest.mock("@/hooks/useAdminUsers");
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/components/ui/switch", () => ({
    Switch: ({
        checked,
        onCheckedChange,
        "aria-label": ariaLabel,
        disabled,
    }: {
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        "aria-label"?: string;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            role="switch"
            aria-checked={!!checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
        />
    ),
}));

jest.mock("@/components/ui/dropdown-menu", () => {
    function DropdownMenu({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    }

    function DropdownMenuTrigger({
        children,
        render,
        ...props
    }: {
        children?: React.ReactNode;
        render?: React.ReactElement;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
        if (render) {
            const { cloneElement: mockCloneElement } = jest.requireActual("react") as {
                cloneElement: typeof React.cloneElement;
            };
            return mockCloneElement(render, props, children);
        }
        return (
            <button type="button" {...props}>
                {children}
            </button>
        );
    }

    function DropdownMenuContent({ children }: { children: React.ReactNode }) {
        return <div role="menu">{children}</div>;
    }

    function DropdownMenuItem({
        children,
        onClick,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
    }) {
        return (
            <button type="button" role="menuitem" onClick={onClick}>
                {children}
            </button>
        );
    }

    return {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
    };
});

const mockUseAdminUsers = useAdminUsersHook.useAdminUsers as jest.MockedFunction<
    typeof useAdminUsersHook.useAdminUsers
>;
const mockUseUpdateUser = useAdminUsersHook.useUpdateUser as jest.MockedFunction<
    typeof useAdminUsersHook.useUpdateUser
>;
const mockUseGrantTokens = useAdminUsersHook.useGrantTokens as jest.MockedFunction<
    typeof useAdminUsersHook.useGrantTokens
>;

const mockUsers: IAdminUser[] = [
    {
        uid: "user1",
        email: "test@example.com",
        role: "client",
        isActive: true,
        tokenBalance: 100,
        displayName: "Test",
        photoURL: null,
        createdAt: "2026-07-01",
        lastLoginAt: "2026-07-22T12:00:00.000Z",
    },
    {
        uid: "user2",
        email: "admin@example.com",
        role: "admin",
        isActive: true,
        tokenBalance: 500,
        displayName: "Admin",
        photoURL: null,
        createdAt: "2026-06-01",
        lastLoginAt: "2026-07-22T12:00:00.000Z",
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

const mutateAsync = jest.fn().mockResolvedValue({});

function getPageButton(page: number): HTMLElement {
    const button = screen
        .getAllByRole("button", { name: "users.page" })
        .find((el) => el.textContent === String(page));
    if (!button) {
        throw new Error(`Page button ${page} not found`);
    }
    return button;
}

const setupMocks = (
    overrides: Partial<ReturnType<typeof useAdminUsersHook.useAdminUsers>> = {},
) => {
    mockUseAdminUsers.mockReturnValue({
        data: { users: mockUsers, total: 2, limit: 20, offset: 0 },
        isLoading: false,
        isError: false,
        error: null,
        ...overrides,
    } as unknown as ReturnType<typeof useAdminUsersHook.useAdminUsers>);

    mockUseUpdateUser.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
    } as unknown as ReturnType<typeof useAdminUsersHook.useUpdateUser>);

    mockUseGrantTokens.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        isPending: false,
    } as unknown as ReturnType<typeof useAdminUsersHook.useGrantTokens>);
};

describe("AdminUsersPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mutateAsync.mockResolvedValue({});
    });

    it("renders page title and total users", () => {
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        expect(screen.getByText("users.title")).toBeInTheDocument();
        expect(screen.getByText("users.totalUsers")).toBeInTheDocument();
        expect(screen.getByText("users.showing")).toBeInTheDocument();
    });

    it("renders users table with data", async () => {
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText("test@example.com")).toBeInTheDocument();
        });
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    });

    it("shows dash total while loading", () => {
        setupMocks({ isLoading: true, data: undefined });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        expect(screen.getByText("users.totalUsersLoading")).toBeInTheDocument();
    });

    it("shows error state when fetch fails", () => {
        setupMocks({ isError: true, data: undefined });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        expect(screen.getByText("users.loadError")).toBeInTheDocument();
    });

    it("opens edit modal and saves user", async () => {
        const user = userEvent.setup();
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getAllByRole("menuitem", { name: "users.table.edit" })[0]!,
        );

        await waitFor(() => {
            expect(screen.getByText("users.edit.title")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: "users.edit.save" }));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                userId: "user1",
                updates: expect.objectContaining({
                    role: "client",
                    isActive: true,
                    tokenBalance: 100,
                }),
            });
            expect(toast.success).toHaveBeenCalledWith("users.updated");
        });
    });

    it("toggles user active status", async () => {
        const user = userEvent.setup();
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getAllByRole("switch", {
                name: "users.table.toggleActive",
            })[0]!,
        );

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                userId: "user1",
                updates: { isActive: false },
            });
            expect(toast.success).toHaveBeenCalledWith("users.deactivated");
        });
    });

    it("shows error toast when toggle active fails", async () => {
        const user = userEvent.setup();
        mutateAsync.mockRejectedValueOnce(new Error("fail"));
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getAllByRole("switch", {
                name: "users.table.toggleActive",
            })[0]!,
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("users.statusUpdateError");
        });
    });

    it("grants and revokes admin role", async () => {
        const user = userEvent.setup();
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getByRole("menuitem", { name: "users.table.grantAdmin" }),
        );

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                userId: "user1",
                updates: { role: "admin" },
            });
            expect(toast.success).toHaveBeenCalledWith("users.adminGranted");
        });

        await user.click(
            screen.getByRole("menuitem", { name: "users.table.revokeAdmin" }),
        );

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                userId: "user2",
                updates: { role: "client" },
            });
            expect(toast.success).toHaveBeenCalledWith("users.adminRevoked");
        });
    });

    it("shows error toast when toggle admin fails", async () => {
        const user = userEvent.setup();
        mutateAsync.mockRejectedValueOnce(new Error("fail"));
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getByRole("menuitem", { name: "users.table.grantAdmin" }),
        );

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("users.roleUpdateError");
        });
    });

    it("activates an inactive user", async () => {
        const user = userEvent.setup();
        setupMocks({
            data: {
                users: [{ ...mockUsers[0]!, isActive: false }],
                total: 1,
                limit: 20,
                offset: 0,
            },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(
            screen.getByRole("switch", {
                name: "users.table.toggleActive",
            }),
        );

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                userId: "user1",
                updates: { isActive: true },
            });
            expect(toast.success).toHaveBeenCalledWith("users.activated");
        });
    });

    it("paginates with Next and Previous", async () => {
        const user = userEvent.setup();
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            ...mockUsers[0]!,
            uid: `user${i}`,
            email: `user${i}@example.com`,
            displayName: `User ${i}`,
        }));

        setupMocks({
            data: { users: manyUsers, total: 50, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        expect(screen.getByText("users.showing")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "users.prevPage" })).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "users.nextPage" }),
        ).not.toBeDisabled();

        await user.click(screen.getByRole("button", { name: "users.nextPage" }));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ offset: 20 }),
            );
        });

        await user.click(screen.getByRole("button", { name: "users.prevPage" }));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ offset: 0 }),
            );
        });
    });

    it("navigates to a specific page number", async () => {
        const user = userEvent.setup();
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            ...mockUsers[0]!,
            uid: `user${i}`,
            email: `user${i}@example.com`,
            displayName: `User ${i}`,
        }));

        setupMocks({
            data: { users: manyUsers, total: 160, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(getPageButton(3));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ offset: 40 }),
            );
        });
    });

    it("shows trailing ellipsis window on late pages", async () => {
        const user = userEvent.setup();
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            ...mockUsers[0]!,
            uid: `user${i}`,
            email: `user${i}@example.com`,
            displayName: `User ${i}`,
        }));

        setupMocks({
            data: { users: manyUsers, total: 160, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(getPageButton(3));

        await waitFor(() => {
            expect(getPageButton(8)).toBeInTheDocument();
        });

        await user.click(getPageButton(8));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ offset: 140 }),
            );
            expect(getPageButton(6)).toBeInTheDocument();
            expect(getPageButton(7)).toBeInTheDocument();
            expect(screen.getByText("…")).toBeInTheDocument();
        });
    });

    it("shows middle ellipsis window for mid-range pages", async () => {
        const user = userEvent.setup();
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            ...mockUsers[0]!,
            uid: `user${i}`,
            email: `user${i}@example.com`,
            displayName: `User ${i}`,
        }));

        setupMocks({
            data: { users: manyUsers, total: 200, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.click(getPageButton(3));
        await user.click(screen.getByRole("button", { name: "users.nextPage" }));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ offset: 60 }),
            );
            expect(getPageButton(3)).toBeInTheDocument();
            expect(getPageButton(4)).toBeInTheDocument();
            expect(getPageButton(5)).toBeInTheDocument();
            expect(screen.getAllByText("…")).toHaveLength(2);
        });
    });

    it("ignores navigation when clicking the current page", async () => {
        const user = userEvent.setup();
        setupMocks({
            data: { users: mockUsers, total: 2, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        const callCountBefore = mockUseAdminUsers.mock.calls.length;
        await user.click(getPageButton(1));

        expect(mockUseAdminUsers.mock.calls.length).toBe(callCountBefore);
        expect(mockUseAdminUsers).toHaveBeenLastCalledWith(
            expect.objectContaining({
                sortBy: "createdAt",
                sortOrder: "desc",
            }),
        );
        expect(mockUseAdminUsers.mock.calls.at(-1)?.[0]).not.toHaveProperty("offset");
    });

    it("disables Next when there are no users", () => {
        setupMocks({
            data: { users: [], total: 0, limit: 20, offset: 0 },
        });

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        expect(screen.getByRole("button", { name: "users.nextPage" })).toBeDisabled();
        expect(screen.getByText("users.totalUsers")).toBeInTheDocument();
        expect(screen.getByText("users.showing")).toBeInTheDocument();
    });

    it("applies search, role, and status filters then resets them", async () => {
        const user = userEvent.setup();
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        await user.type(
            screen.getByPlaceholderText("users.filters.searchPlaceholder"),
            "alice",
        );

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: "alice",
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.admins"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: "admin",
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.clients"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: "client",
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.allRoles"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: undefined,
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.active"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    isActive: true,
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.inactive"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    isActive: false,
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByText("users.filters.allStatuses"));
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    isActive: undefined,
                    offset: 0,
                }),
            );
        });

        await user.click(screen.getByRole("button", { name: "users.filters.clear" }));

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    sortBy: "createdAt",
                    sortOrder: "desc",
                }),
            );
        });

        // Debounced empty search after Clear covers `search || undefined`
        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: undefined,
                    offset: 0,
                }),
            );
        });
    });

    it("clears search filter when the query is emptied", async () => {
        const user = userEvent.setup();
        setupMocks();

        render(<AdminUsersPage />, { wrapper: createWrapper() });

        const searchInput = screen.getByPlaceholderText(
            "users.filters.searchPlaceholder",
        );
        await user.type(searchInput, "bob");

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({ search: "bob" }),
            );
        });

        await user.clear(searchInput);

        await waitFor(() => {
            expect(mockUseAdminUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: undefined,
                    offset: 0,
                }),
            );
        });
    });
});

describe("resolvePageOffset", () => {
    it("clamps page below 1 to the first page", () => {
        expect(resolvePageOffset(0, 100, 20, 40)).toBe(0);
        expect(resolvePageOffset(-5, 100, 20, 0)).toBeNull();
    });

    it("clamps page above the last page", () => {
        expect(resolvePageOffset(99, 100, 20, 0)).toBe(80);
        expect(resolvePageOffset(99, 100, 20, 80)).toBeNull();
    });

    it("returns null when the offset is unchanged", () => {
        expect(resolvePageOffset(2, 100, 20, 20)).toBeNull();
        expect(resolvePageOffset(1, 0, 20, 0)).toBeNull();
    });
});
