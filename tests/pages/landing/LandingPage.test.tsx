import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "@/pages/landing/LandingPage";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

jest.mock("@/components/layout/LanguageSwitcher", () => ({
    LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    };
}

function renderPage() {
    const Wrapper = createWrapper();
    return render(
        <Wrapper>
            <LandingPage />
        </Wrapper>,
    );
}

describe("LandingPage", () => {
    it("renders the public navbar brand", () => {
        renderPage();
        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
    });

    it("renders the hero section", () => {
        renderPage();
        expect(screen.getByText("hero.badge")).toBeInTheDocument();
    });

    it("renders the Why SentientArchive section", () => {
        renderPage();
        expect(screen.getByText("why.title")).toBeInTheDocument();
    });

    it("renders the Features section", () => {
        renderPage();
        expect(screen.getByText("features.title")).toBeInTheDocument();
    });

    it("renders the How It Works section", () => {
        renderPage();
        expect(screen.getByText("howItWorks.title")).toBeInTheDocument();
    });

    it("renders the Token System section", () => {
        renderPage();
        expect(screen.getByText("tokens.title")).toBeInTheDocument();
    });

    it("renders the footer", () => {
        renderPage();
        expect(screen.getByText("footer.tagline")).toBeInTheDocument();
    });
});
