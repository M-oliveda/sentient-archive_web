import type React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import type { IAdminUser } from "@/types/admin";

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
        return <div data-testid="dropdown-menu">{children}</div>;
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

const mockUsers: IAdminUser[] = [
    {
        uid: "user1",
        email: "user1@example.com",
        displayName: "User One",
        photoURL: null,
        role: "client",
        isActive: true,
        tokenBalance: 100,
        createdAt: "2026-07-01",
        lastLoginAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22",
    },
    {
        uid: "user2",
        email: "admin@example.com",
        displayName: "Admin User",
        photoURL: null,
        role: "admin",
        isActive: true,
        tokenBalance: 5000,
        createdAt: "2026-06-01",
        lastLoginAt: "2026-07-22T12:00:00.000Z",
        updatedAt: "2026-07-22",
    },
];

const inactiveUser: IAdminUser = {
    uid: "user3",
    email: "inactive@example.com",
    displayName: null,
    photoURL: null,
    role: "client",
    isActive: false,
    tokenBalance: 0,
    createdAt: undefined,
    lastLoginAt: undefined,
    updatedAt: undefined,
};

describe("AdminUsersTable", () => {
    const mockHandlers = {
        onEditUser: jest.fn(),
        onToggleActive: jest.fn(),
        onToggleAdmin: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders users in a table", () => {
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        expect(screen.getByText("user1@example.com")).toBeInTheDocument();
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
        expect(screen.getByText("User One")).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "users.table.user" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("columnheader", { name: "users.table.role" }),
        ).toBeInTheDocument();
    });

    it("displays role badges correctly", () => {
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        expect(screen.getByText("users.table.client")).toBeInTheDocument();
        expect(screen.getByText("users.table.admin")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        render(<AdminUsersTable data={[]} isLoading={true} {...mockHandlers} />);

        expect(screen.getByTestId("admin-users-loading")).toBeInTheDocument();
    });

    it("shows empty state", () => {
        render(<AdminUsersTable data={[]} isLoading={false} {...mockHandlers} />);

        expect(screen.getByText("users.empty")).toBeInTheDocument();
    });

    it("shows Low badge for low token balances", () => {
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        expect(screen.getByText("users.table.low")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("5,000")).toBeInTheDocument();
    });

    it("toggles active status via switch", async () => {
        const user = userEvent.setup();
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        await user.click(
            screen.getAllByRole("switch", {
                name: "users.table.toggleActive",
            })[0]!,
        );

        expect(mockHandlers.onToggleActive).toHaveBeenCalledWith(mockUsers[0]);
    });

    it("opens actions menu and edits a user", async () => {
        const user = userEvent.setup();
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        await user.click(
            screen.getAllByRole("menuitem", { name: "users.table.edit" })[0]!,
        );

        expect(mockHandlers.onEditUser).toHaveBeenCalledWith(mockUsers[0]);
    });

    it("grants and revokes admin from actions menu", async () => {
        const user = userEvent.setup();
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        await user.click(
            screen.getByRole("menuitem", { name: "users.table.grantAdmin" }),
        );
        expect(mockHandlers.onToggleAdmin).toHaveBeenCalledWith(mockUsers[0]);

        await user.click(
            screen.getByRole("menuitem", { name: "users.table.revokeAdmin" }),
        );
        expect(mockHandlers.onToggleAdmin).toHaveBeenCalledWith(mockUsers[1]);
    });

    it("falls back to email when displayName is missing", () => {
        render(
            <AdminUsersTable
                data={[inactiveUser]}
                isLoading={false}
                {...mockHandlers}
            />,
        );

        expect(screen.getAllByText("inactive@example.com")).toHaveLength(2);
        expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });

    it("disables status switch while updating", () => {
        render(
            <AdminUsersTable
                data={mockUsers}
                isLoading={false}
                isUpdating
                {...mockHandlers}
            />,
        );

        expect(
            screen.getAllByRole("switch", {
                name: "users.table.toggleActive",
            })[0],
        ).toBeDisabled();
    });

    it("does not call handlers when only rendering", () => {
        render(
            <AdminUsersTable data={mockUsers} isLoading={false} {...mockHandlers} />,
        );

        expect(mockHandlers.onEditUser).not.toHaveBeenCalled();
        expect(mockHandlers.onToggleActive).not.toHaveBeenCalled();
        expect(mockHandlers.onToggleAdmin).not.toHaveBeenCalled();
        fireEvent.click(document.body);
    });
});
