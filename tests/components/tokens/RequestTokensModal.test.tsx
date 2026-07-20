import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { RequestTokensModal } from "@/components/tokens/RequestTokensModal";
import { useAuthStore } from "@/stores/authStore";
import { useRequestTokens } from "@/hooks/useRequestTokens";

let capturedDialogOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/dialog", () => ({
    Dialog: ({
        children,
        open,
        onOpenChange,
    }: {
        children: React.ReactNode;
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }) => {
        capturedDialogOnOpenChange = onOpenChange;
        return open ? <div data-testid="dialog">{children}</div> : null;
    },
    DialogContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-content">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useRequestTokens");

const mockMutate = jest.fn();
const mockReset = jest.fn();

const defaultRequestTokens = {
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isError: false,
};

const mockUser = {
    uid: "user-1",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
    role: "client" as const,
    isActive: true,
    tokenBalance: 150,
};

describe("RequestTokensModal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });
        (useRequestTokens as jest.Mock).mockReturnValue({ ...defaultRequestTokens });
    });

    it("renders dialog title when open", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByText("Request Tokens")).toBeInTheDocument();
    });

    it("does not render dialog content when closed", () => {
        render(<RequestTokensModal open={false} onOpenChange={jest.fn()} />);
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
        expect(screen.queryByText("Request Tokens")).not.toBeInTheDocument();
    });

    it("handleClose with true passes through without resetting state", () => {
        const onOpenChange = jest.fn();
        render(<RequestTokensModal open={true} onOpenChange={onOpenChange} />);
        act(() => {
            capturedDialogOnOpenChange?.(true);
        });
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(mockReset).not.toHaveBeenCalled();
    });

    it("shows the current token balance", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByText(/150 Tokens/)).toBeInTheDocument();
    });

    it("shows 0 tokens when user is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByText(/0 Tokens/)).toBeInTheDocument();
    });

    it("submit button is disabled when amount is empty", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByRole("button", { name: /Submit Request/ })).toBeDisabled();
    });

    it("submit button is disabled when amount is 0", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
            target: { value: "0" },
        });
        expect(screen.getByRole("button", { name: /Submit Request/ })).toBeDisabled();
    });

    it("submit button is enabled when amount is valid", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
            target: { value: "500" },
        });
        expect(
            screen.getByRole("button", { name: /Submit Request/ }),
        ).not.toBeDisabled();
    });

    it("calls mutate with parsed amount on submit", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
            target: { value: "300" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Submit Request/ }));
        expect(mockMutate).toHaveBeenCalledWith(
            { amount: 300 },
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        );
    });

    it("does not call mutate when amount is invalid", () => {
        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: /Submit Request/ }));
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("shows success state after successful submission", async () => {
        (useRequestTokens as jest.Mock).mockReturnValue({
            ...defaultRequestTokens,
            mutate: (_: unknown, options: { onSuccess: () => void }) => {
                options.onSuccess();
            },
        });

        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
            target: { value: "200" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Submit Request/ }));

        await waitFor(() => {
            expect(screen.getByText("Request sent!")).toBeInTheDocument();
        });
    });

    it("Done button closes modal and resets state", async () => {
        const onOpenChange = jest.fn();
        (useRequestTokens as jest.Mock).mockReturnValue({
            ...defaultRequestTokens,
            mutate: (_: unknown, options: { onSuccess: () => void }) =>
                options.onSuccess(),
        });

        render(<RequestTokensModal open={true} onOpenChange={onOpenChange} />);
        fireEvent.change(screen.getByPlaceholderText("e.g. 500"), {
            target: { value: "100" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Submit Request/ }));

        await waitFor(() => expect(screen.getByText("Done")).toBeInTheDocument());

        fireEvent.click(screen.getByRole("button", { name: "Done" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(mockReset).toHaveBeenCalled();
    });

    it("Cancel button closes modal", () => {
        const onOpenChange = jest.fn();
        render(<RequestTokensModal open={true} onOpenChange={onOpenChange} />);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows error message when mutation fails", () => {
        (useRequestTokens as jest.Mock).mockReturnValue({
            ...defaultRequestTokens,
            isError: true,
        });

        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });

    it("shows spinner and disables buttons while pending", () => {
        (useRequestTokens as jest.Mock).mockReturnValue({
            ...defaultRequestTokens,
            isPending: true,
        });

        render(<RequestTokensModal open={true} onOpenChange={jest.fn()} />);
        expect(screen.getByText(/Submitting/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
});
