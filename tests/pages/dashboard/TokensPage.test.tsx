import { render, screen, fireEvent } from "@testing-library/react";
import { TokensPage } from "@/pages/dashboard/TokensPage";
import { useAuthStore } from "@/stores/authStore";
import { useTokenBalance } from "@/hooks/useTokenBalance";

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useTokenBalance");
jest.mock("@/components/tokens/TokenBalance", () => ({
    TokenBalance: ({ balance }: { balance: number }) => (
        <div data-testid="token-balance">{balance}</div>
    ),
}));
jest.mock("@/components/tokens/TransactionHistory", () => ({
    TransactionHistory: () => <div data-testid="transaction-history" />,
}));
jest.mock("@/components/tokens/PendingRequests", () => ({
    PendingRequests: () => <div data-testid="pending-requests" />,
}));
jest.mock("@/components/tokens/RequestTokensModal", () => ({
    RequestTokensModal: ({
        open,
        onOpenChange,
    }: {
        open: boolean;
        onOpenChange: (v: boolean) => void;
    }) => (
        <div data-testid="request-tokens-modal" data-open={open}>
            <button onClick={() => onOpenChange(false)}>Close</button>
        </div>
    ),
}));

const mockUser = {
    uid: "user-1",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
    role: "client" as const,
    isActive: true,
    tokenBalance: 750,
};

describe("TokensPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });
        (useTokenBalance as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
    });

    it("renders the page header", () => {
        render(<TokensPage />);
        expect(screen.getByText("page.title")).toBeInTheDocument();
        expect(screen.getByText("page.eyebrow")).toBeInTheDocument();
    });

    it("renders the Request More Tokens button", () => {
        render(<TokensPage />);
        expect(screen.getByTestId("request-tokens-button")).toBeInTheDocument();
        expect(screen.getByText("page.requestMore")).toBeInTheDocument();
    });

    it("clicking Request More Tokens opens the modal", () => {
        render(<TokensPage />);
        const modal = screen.getByTestId("request-tokens-modal");
        expect(modal).toHaveAttribute("data-open", "false");

        fireEvent.click(screen.getByTestId("request-tokens-button"));

        expect(modal).toHaveAttribute("data-open", "true");
    });

    it("renders TokenBalance with the user's token balance", () => {
        render(<TokensPage />);
        expect(screen.getByTestId("token-balance")).toHaveTextContent("750");
    });

    it("prefers the live token balance API value over the auth store", () => {
        (useTokenBalance as jest.Mock).mockReturnValue({
            data: { balance: 955, totalGranted: 5000, totalSpent: 4045 },
            isLoading: false,
        });
        render(<TokensPage />);
        expect(screen.getByTestId("token-balance")).toHaveTextContent("955");
    });

    it("renders TokenBalance with 0 when user is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<TokensPage />);
        expect(screen.getByTestId("token-balance")).toHaveTextContent("0");
    });

    it("renders Transaction History section", () => {
        render(<TokensPage />);
        expect(screen.getByText("page.transactionHistory")).toBeInTheDocument();
        expect(screen.getByTestId("transaction-history")).toBeInTheDocument();
    });

    it("renders the PendingRequests component", () => {
        render(<TokensPage />);
        expect(screen.getByTestId("pending-requests")).toBeInTheDocument();
    });
});
