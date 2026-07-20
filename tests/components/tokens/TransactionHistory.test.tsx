import { render, screen } from "@testing-library/react";
import { TransactionHistory } from "@/components/tokens/TransactionHistory";
import { useTransactions } from "@/hooks/useTransactions";
import type { ITransaction } from "@/types/transaction";

jest.mock("@/hooks/useTransactions");

const mockTransaction = (overrides: Partial<ITransaction> = {}): ITransaction => ({
    id: "tx-1",
    userId: "user-1",
    type: "debit",
    amount: 2,
    reason: "ai_summarize",
    noteId: "note-1",
    balanceAfter: 98,
    createdAt: new Date("2024-06-01T12:00:00Z"),
    ...overrides,
});

describe("TransactionHistory", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading skeleton when data is loading", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<TransactionHistory />);
        expect(screen.getByTestId("transaction-history-loading")).toBeInTheDocument();
    });

    it("shows empty state when there are no transactions", () => {
        (useTransactions as jest.Mock).mockReturnValue({ data: [], isLoading: false });
        render(<TransactionHistory />);
        expect(screen.getByTestId("transaction-history-empty")).toBeInTheDocument();
    });

    it("shows empty state when data is undefined and not loading", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByTestId("transaction-history-empty")).toBeInTheDocument();
    });

    it("renders transaction table when transactions are present", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction()],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByTestId("transaction-history-table")).toBeInTheDocument();
    });

    it("renders table column headers", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction()],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Change")).toBeInTheDocument();
        expect(screen.getByText("Balance")).toBeInTheDocument();
    });

    it("displays human-readable reason label for ai_summarize", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction({ reason: "ai_summarize" })],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText("AI Summary")).toBeInTheDocument();
    });

    it("displays human-readable reason labels for all reasons", () => {
        const transactions: ITransaction[] = [
            mockTransaction({ id: "1", reason: "ai_summarize" }),
            mockTransaction({ id: "2", reason: "ai_autotag" }),
            mockTransaction({ id: "3", reason: "ai_flashcards" }),
            mockTransaction({ id: "4", reason: "ai_ragquery" }),
            mockTransaction({ id: "5", reason: "admin_grant" }),
            mockTransaction({ id: "6", reason: "initial_grant" }),
        ];
        (useTransactions as jest.Mock).mockReturnValue({
            data: transactions,
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText("AI Summary")).toBeInTheDocument();
        expect(screen.getByText("AI Auto-Tag")).toBeInTheDocument();
        expect(screen.getByText("AI Flashcards")).toBeInTheDocument();
        expect(screen.getByText("AI Q&A")).toBeInTheDocument();
        expect(screen.getByText("Admin Grant")).toBeInTheDocument();
        expect(screen.getByText("Welcome Bonus")).toBeInTheDocument();
    });

    it("shows debit amount with minus sign in error color", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction({ type: "debit", amount: 5 })],
            isLoading: false,
        });
        render(<TransactionHistory />);
        const changeCell = screen.getByText(/−5/);
        expect(changeCell).toBeInTheDocument();
        expect(changeCell.className).toContain("text-[hsl(var(--error))]");
    });

    it("shows credit amount with plus sign in success color", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [
                mockTransaction({ type: "credit", amount: 100, reason: "admin_grant" }),
            ],
            isLoading: false,
        });
        render(<TransactionHistory />);
        const changeCell = screen.getByText(/\+100/);
        expect(changeCell).toBeInTheDocument();
        expect(changeCell.className).toContain("text-[hsl(var(--success))]");
    });

    it("renders balanceAfter value", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction({ balanceAfter: 98 })],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText("98")).toBeInTheDocument();
    });

    it("renders formatted date", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [mockTransaction({ createdAt: new Date("2024-06-01T12:00:00Z") })],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText(/Jun 1, 2024/)).toBeInTheDocument();
    });

    it("falls back to the raw reason string when reason is not in REASON_LABELS", () => {
        (useTransactions as jest.Mock).mockReturnValue({
            data: [
                mockTransaction({
                    reason: "unknown_reason" as unknown as ITransaction["reason"],
                }),
            ],
            isLoading: false,
        });
        render(<TransactionHistory />);
        expect(screen.getByText("unknown_reason")).toBeInTheDocument();
    });
});
