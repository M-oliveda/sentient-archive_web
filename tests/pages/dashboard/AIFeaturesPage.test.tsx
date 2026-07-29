import { render, screen, fireEvent } from "@testing-library/react";
import { AIFeaturesPage } from "@/pages/dashboard/AIFeaturesPage";
import { useAuthStore } from "@/stores/authStore";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useClientConfig } from "@/hooks/useClientConfig";
import { DEFAULT_FEATURE_FLAGS, DEFAULT_TOKEN_COSTS } from "@/types/config";

jest.mock("@/stores/authStore");
jest.mock("@/hooks/useTokenBalance");
jest.mock("@/hooks/useClientConfig");
jest.mock("@tanstack/react-router", () => ({
    Link: ({
        to,
        children,
        className,
        "data-testid": testId,
    }: {
        to: string;
        children: React.ReactNode;
        className?: string;
        "data-testid"?: string;
    }) => (
        <a href={to} className={className} data-testid={testId}>
            {children}
        </a>
    ),
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
    tokenBalance: 450,
};

describe("AIFeaturesPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });
        (useTokenBalance as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
        (useClientConfig as jest.Mock).mockReturnValue({
            features: DEFAULT_FEATURE_FLAGS,
            tokenCosts: DEFAULT_TOKEN_COSTS,
            isLoading: false,
            isError: false,
        });
    });

    it("renders the hero badge and heading", () => {
        render(<AIFeaturesPage />);
        expect(screen.getByText("hub.badge")).toBeInTheDocument();
        expect(screen.getByText("hub.title")).toBeInTheDocument();
    });

    it("falls back to the auth store balance when hook has no data yet", () => {
        render(<AIFeaturesPage />);
        expect(screen.getByText(/450/)).toBeInTheDocument();
    });

    it("prefers live balance from the hook over the stale store value", () => {
        (useTokenBalance as jest.Mock).mockReturnValue({
            data: { balance: 999, totalGranted: 1000, totalSpent: 1 },
            isLoading: false,
            isError: false,
        });

        render(<AIFeaturesPage />);

        expect(screen.getByText(/999/)).toBeInTheDocument();
        expect(screen.queryByText(/450/)).not.toBeInTheDocument();
    });

    it("renders 0 as balance when user is null and hook has no data", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<AIFeaturesPage />);
        expect(screen.getByText("hub.availableBalance")).toBeInTheDocument();
        expect(screen.queryByText(/450/)).not.toBeInTheDocument();
    });

    it("renders all 4 AI feature cards", () => {
        render(<AIFeaturesPage />);
        expect(screen.getByTestId("feature-card-summarize")).toBeInTheDocument();
        expect(screen.getByTestId("feature-card-autoTag")).toBeInTheDocument();
        expect(screen.getByTestId("feature-card-flashcards")).toBeInTheDocument();
        expect(screen.getByTestId("feature-card-ragQuery")).toBeInTheDocument();
    });

    it("hides disabled feature cards", () => {
        (useClientConfig as jest.Mock).mockReturnValue({
            features: {
                ...DEFAULT_FEATURE_FLAGS,
                flashcardsEnabled: false,
                ragQueryEnabled: false,
            },
            tokenCosts: DEFAULT_TOKEN_COSTS,
            isLoading: false,
            isError: false,
        });

        render(<AIFeaturesPage />);

        expect(screen.getByTestId("feature-card-summarize")).toBeInTheDocument();
        expect(screen.queryByTestId("feature-card-flashcards")).not.toBeInTheDocument();
        expect(screen.queryByTestId("feature-card-ragQuery")).not.toBeInTheDocument();
    });

    it("shows empty state when all AI features are disabled", () => {
        (useClientConfig as jest.Mock).mockReturnValue({
            features: {
                summarizeEnabled: false,
                autoTagEnabled: false,
                flashcardsEnabled: false,
                ragQueryEnabled: false,
                fileExtractionEnabled: true,
            },
            tokenCosts: DEFAULT_TOKEN_COSTS,
            isLoading: false,
            isError: false,
        });

        render(<AIFeaturesPage />);

        expect(screen.getByTestId("no-ai-features")).toBeInTheDocument();
        expect(screen.getByText("hub.noFeatures")).toBeInTheDocument();
    });

    it("renders token cost on each feature card", () => {
        render(<AIFeaturesPage />);
        expect(screen.getAllByText("hub.tokenCost")).toHaveLength(4);
    });

    it("renders How Tokens Work section with 3 steps", () => {
        render(<AIFeaturesPage />);
        expect(screen.getByText("hub.howTokensWork")).toBeInTheDocument();
        expect(screen.getByText(/1\. hub\.steps\.select\.title/)).toBeInTheDocument();
        expect(screen.getByText(/2\. hub\.steps\.spend\.title/)).toBeInTheDocument();
        expect(screen.getByText(/3\. hub\.steps\.insights\.title/)).toBeInTheDocument();
    });

    it("Top Up Tokens button opens RequestTokensModal", () => {
        render(<AIFeaturesPage />);
        const modal = screen.getByTestId("request-tokens-modal");
        expect(modal).toHaveAttribute("data-open", "false");

        fireEvent.click(screen.getByTestId("top-up-tokens-button"));

        expect(modal).toHaveAttribute("data-open", "true");
    });

    it("feature cards link to /notes", () => {
        render(<AIFeaturesPage />);
        const cards = screen.getAllByRole("link");
        cards.forEach((card) => {
            expect(card).toHaveAttribute("href", "/notes");
        });
    });
});
