import { render, screen } from "@testing-library/react";
import { PendingRequests } from "@/components/tokens/PendingRequests";
import { useMyTokenRequests } from "@/hooks/useMyTokenRequests";
import type { IMyTokenRequest } from "@/hooks/useMyTokenRequests";

jest.mock("@/hooks/useMyTokenRequests");

const mockRequest = (overrides: Partial<IMyTokenRequest> = {}): IMyTokenRequest => ({
    id: "req-1",
    userId: "user-1",
    amount: 500,
    status: "pending",
    createdAt: "2024-06-01T12:00:00Z",
    ...overrides,
});

describe("PendingRequests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading skeleton when data is loading", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<PendingRequests />);
        expect(screen.getByTestId("pending-requests-loading")).toBeInTheDocument();
        expect(screen.getByText("Token Requests")).toBeInTheDocument();
    });

    it("renders nothing when there are no requests", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        });
        const { container } = render(<PendingRequests />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing when data is undefined and not loading", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });
        const { container } = render(<PendingRequests />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders the table when requests are present", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest()],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByTestId("pending-requests")).toBeInTheDocument();
        expect(screen.getByTestId("pending-requests-table")).toBeInTheDocument();
    });

    it("renders table column headers", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest()],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Amount")).toBeInTheDocument();
        expect(screen.getByText("Reason")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("displays the justification in the Reason column", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [
                mockRequest({
                    justification: "Need tokens for embeddings",
                }),
            ],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Need tokens for embeddings")).toBeInTheDocument();
    });

    it("displays a dash when justification is missing", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ justification: undefined })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("displays the rejection reason for rejected requests", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [
                mockRequest({
                    status: "rejected",
                    justification: "Original ask",
                    reason: "Insufficient justification",
                }),
            ],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Insufficient justification")).toBeInTheDocument();
    });

    it("renders a row for each request", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ id: "req-1" }), mockRequest({ id: "req-2" })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getAllByTestId("request-row")).toHaveLength(2);
    });

    it("displays the formatted amount with a plus sign", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ amount: 500 })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("+500")).toBeInTheDocument();
    });

    it("displays the formatted date", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ createdAt: "2024-06-01T12:00:00Z" })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText(/Jun 1, 2024/)).toBeInTheDocument();
    });

    it("shows 'Pending' badge for pending status", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ status: "pending" })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("shows 'Approved' badge for approved status", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ status: "approved" })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("shows 'Rejected' badge for rejected status", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest({ status: "rejected" })],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("renders the section heading when requests are present", () => {
        (useMyTokenRequests as jest.Mock).mockReturnValue({
            data: [mockRequest()],
            isLoading: false,
        });
        render(<PendingRequests />);
        expect(screen.getByText("Token Requests")).toBeInTheDocument();
    });
});
