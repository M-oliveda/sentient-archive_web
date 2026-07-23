import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditUserModal } from "@/components/admin/EditUserModal";
import type { IAdminUser } from "@/types/admin";

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockUser: IAdminUser = {
    uid: "user1",
    email: "user@example.com",
    displayName: "Test User",
    photoURL: null,
    role: "client",
    isActive: true,
    tokenBalance: 100,
    createdAt: "2026-07-01",
    lastLoginAt: "2026-07-22",
    updatedAt: "2026-07-22",
};

describe("EditUserModal", () => {
    const defaultProps = {
        user: mockUser,
        isOpen: true,
        isLoading: false,
        onOpenChange: jest.fn(),
        onSubmit: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders user email in the description", () => {
        render(<EditUserModal {...defaultProps} />);

        expect(screen.getByText("Edit User")).toBeInTheDocument();
        expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });

    it("does not render form fields when user is null", () => {
        render(<EditUserModal {...defaultProps} user={null} />);

        expect(screen.queryByLabelText("Token Balance")).not.toBeInTheDocument();
    });

    it("changes role when role badge is clicked", async () => {
        render(<EditUserModal {...defaultProps} />);

        await userEvent.click(screen.getByText("admin"));

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith("user1", {
                role: "admin",
                isActive: true,
                tokenBalance: 100,
            });
        });
    });

    it("changes status when status badge is clicked", async () => {
        render(<EditUserModal {...defaultProps} />);

        await userEvent.click(screen.getByText("Inactive"));

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith("user1", {
                role: "client",
                isActive: false,
                tokenBalance: 100,
            });
        });
    });

    it("updates token balance from input", async () => {
        render(<EditUserModal {...defaultProps} />);

        const input = screen.getByLabelText("Token Balance");
        await userEvent.clear(input);
        await userEvent.type(input, "250");

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                "user1",
                expect.objectContaining({ tokenBalance: 250 }),
            );
        });
    });

    it("treats empty token balance as 0", async () => {
        render(<EditUserModal {...defaultProps} />);

        const input = screen.getByLabelText("Token Balance");
        await userEvent.clear(input);

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                "user1",
                expect.objectContaining({ tokenBalance: 0 }),
            );
        });
    });

    it("shows success toast and closes on successful submit", async () => {
        const { toast } = jest.requireMock("sonner");

        render(<EditUserModal {...defaultProps} />);

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("User updated successfully");
            expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it("shows error toast with Error message on failure", async () => {
        const { toast } = jest.requireMock("sonner");
        const onSubmit = jest.fn().mockRejectedValue(new Error("Update failed"));

        render(<EditUserModal {...defaultProps} onSubmit={onSubmit} />);

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Update failed");
        });
    });

    it("shows generic error toast for non-Error failures", async () => {
        const { toast } = jest.requireMock("sonner");
        const onSubmit = jest.fn().mockRejectedValue("boom");

        render(<EditUserModal {...defaultProps} onSubmit={onSubmit} />);

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to update user");
        });
    });

    it("closes when Cancel is clicked", async () => {
        render(<EditUserModal {...defaultProps} />);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not submit when user is null", async () => {
        const onSubmit = jest.fn();

        render(<EditUserModal {...defaultProps} user={null} onSubmit={onSubmit} />);

        // Dialog still open but no Save button when user is null
        expect(
            screen.queryByRole("button", { name: "Save Changes" }),
        ).not.toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("shows Saving... while submit is in flight", async () => {
        let resolveSubmit: () => void = () => undefined;
        const onSubmit = jest.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSubmit = resolve;
                }),
        );

        render(<EditUserModal {...defaultProps} onSubmit={onSubmit} />);

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        expect(await screen.findByText("Saving...")).toBeInTheDocument();

        resolveSubmit();

        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Save Changes" }),
            ).toBeInTheDocument();
        });
    });

    it("syncs form fields when user prop changes", async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const { rerender } = render(
            <EditUserModal
                {...defaultProps}
                user={null}
                isOpen={false}
                onSubmit={onSubmit}
            />,
        );

        rerender(
            <EditUserModal
                {...defaultProps}
                user={{ ...mockUser, tokenBalance: 999, role: "admin" }}
                isOpen={true}
                onSubmit={onSubmit}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith("user1", {
                role: "admin",
                isActive: true,
                tokenBalance: 999,
            });
        });
    });
});
