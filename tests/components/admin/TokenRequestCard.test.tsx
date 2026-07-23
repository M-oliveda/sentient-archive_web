import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenRequestCard } from "@/components/admin/TokenRequestCard";
import type { ITokenRequest } from "@/types/admin";

const baseRequest: ITokenRequest = {
    id: "req1",
    userId: "user1",
    amount: 50000,
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userEmail: "alice.c@sentient.ai",
    userName: "Alice Chen",
    currentBalance: 0,
    justification:
        "Critical: Running large vector embeddings for the Q3 financial dataset analysis.",
    lastGrantAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isUrgent: true,
};

describe("TokenRequestCard", () => {
    const mockHandlers = {
        onApprove: jest.fn(),
        onReject: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the user name, email, and requested/current amounts", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, currentBalance: 955 }}
                {...mockHandlers}
            />,
        );

        expect(screen.getByText("Alice Chen")).toBeInTheDocument();
        expect(screen.getByText("alice.c@sentient.ai")).toBeInTheDocument();
        expect(screen.getByText("50k TKN")).toBeInTheDocument();
        expect(screen.getByText("955 TKN")).toBeInTheDocument();
    });

    it("does not render an online status indicator on the avatar", () => {
        const { container } = render(
            <TokenRequestCard request={baseRequest} {...mockHandlers} />,
        );

        expect(container.querySelector("[data-slot='avatar-badge']")).toBeNull();
    });

    it("shows the urgent badge for urgent pending requests", () => {
        render(<TokenRequestCard request={baseRequest} {...mockHandlers} />);

        expect(screen.getByText("Urgent!")).toBeInTheDocument();
    });

    it("does not show the urgent badge for standard pending requests", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, isUrgent: false }}
                {...mockHandlers}
            />,
        );

        expect(screen.queryByText("Urgent!")).not.toBeInTheDocument();
    });

    it("renders the justification quote when provided", () => {
        render(<TokenRequestCard request={baseRequest} {...mockHandlers} />);

        expect(screen.getByText("Justification:")).toBeInTheDocument();
        expect(screen.getByText(/Critical: Running large vector/)).toBeInTheDocument();
    });

    it("does not render the justification section when absent", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, justification: undefined }}
                {...mockHandlers}
            />,
        );

        expect(screen.queryByText("Justification:")).not.toBeInTheDocument();
    });

    it("renders the last grant timestamp when provided", () => {
        render(<TokenRequestCard request={baseRequest} {...mockHandlers} />);

        expect(screen.getByText(/Last grant:/)).toBeInTheDocument();
    });

    it("does not render the last grant row when absent", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, lastGrantAt: undefined }}
                {...mockHandlers}
            />,
        );

        expect(screen.queryByText(/Last grant:/)).not.toBeInTheDocument();
    });

    it("falls back to userDisplayName then userEmail then a default label", () => {
        const { rerender } = render(
            <TokenRequestCard
                request={{
                    ...baseRequest,
                    userName: undefined,
                    userDisplayName: "Display Name",
                }}
                {...mockHandlers}
            />,
        );
        expect(screen.getByText("Display Name")).toBeInTheDocument();

        rerender(
            <TokenRequestCard
                request={{
                    ...baseRequest,
                    userName: undefined,
                    userDisplayName: undefined,
                }}
                {...mockHandlers}
            />,
        );
        expect(screen.getAllByText("alice.c@sentient.ai").length).toBeGreaterThan(0);

        rerender(
            <TokenRequestCard
                request={{
                    ...baseRequest,
                    userName: undefined,
                    userDisplayName: undefined,
                    userEmail: undefined,
                }}
                {...mockHandlers}
            />,
        );
        expect(screen.getByText("Unknown User")).toBeInTheDocument();
    });

    it("calls onApprove and onReject when the footer buttons are clicked", async () => {
        render(<TokenRequestCard request={baseRequest} {...mockHandlers} />);

        await userEvent.click(screen.getByText("Approve"));
        expect(mockHandlers.onApprove).toHaveBeenCalledWith(baseRequest);

        await userEvent.click(screen.getByText("Reject"));
        expect(mockHandlers.onReject).toHaveBeenCalledWith(baseRequest);
    });

    it("disables the action buttons while processing", () => {
        render(
            <TokenRequestCard request={baseRequest} {...mockHandlers} isProcessing />,
        );

        expect(screen.getByText("Approve").closest("button")).toBeDisabled();
        expect(screen.getByText("Reject").closest("button")).toBeDisabled();
    });

    it("shows a status badge instead of action buttons for resolved requests", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, status: "approved" }}
                {...mockHandlers}
            />,
        );

        expect(screen.getByText("approved")).toBeInTheDocument();
        expect(screen.queryByText("Approve")).not.toBeInTheDocument();
        expect(screen.queryByText("Reject")).not.toBeInTheDocument();
    });

    it("shows a 'Denied' badge for rejected requests", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, status: "rejected" }}
                {...mockHandlers}
            />,
        );

        expect(screen.getByText("Denied")).toBeInTheDocument();
    });

    it("defaults current balance to 0 when undefined", () => {
        render(
            <TokenRequestCard
                request={{ ...baseRequest, currentBalance: undefined }}
                {...mockHandlers}
            />,
        );

        expect(screen.getByText("0 TKN")).toBeInTheDocument();
    });
});
