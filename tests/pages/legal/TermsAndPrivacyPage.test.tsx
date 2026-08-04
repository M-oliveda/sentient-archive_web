import { render, screen, fireEvent } from "@testing-library/react";
import { TermsAndPrivacyPage } from "@/pages/legal/TermsAndPrivacyPage";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

jest.mock("@/components/layout/LanguageSwitcher", () => ({
    LanguageSwitcher: () => <div data-testid="language-switcher">Language</div>,
}));

describe("TermsAndPrivacyPage", () => {
    beforeEach(() => {
        Object.defineProperty(window, "scrollY", {
            configurable: true,
            value: 0,
            writable: true,
        });
    });

    it("should render legal content and navbar", () => {
        render(<TermsAndPrivacyPage />);

        expect(screen.getByText("page.title")).toBeInTheDocument();
        expect(screen.getByText("page.eyebrow")).toBeInTheDocument();
        expect(screen.getByText("page.introduction.title")).toBeInTheDocument();
        expect(screen.getByText("hello@moliveda.dev")).toBeInTheDocument();
        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
    });

    it("should show scroll-to-top button after scrolling down", () => {
        render(<TermsAndPrivacyPage />);

        expect(
            screen.queryByRole("button", { name: "page.scrollToTop" }),
        ).not.toBeInTheDocument();

        Object.defineProperty(window, "scrollY", { value: 400, writable: true });
        fireEvent.scroll(window);

        expect(
            screen.getByRole("button", { name: "page.scrollToTop" }),
        ).toBeInTheDocument();
    });

    it("should scroll to top when button is clicked", () => {
        const scrollToMock = jest.fn();
        window.scrollTo = scrollToMock;

        render(<TermsAndPrivacyPage />);

        Object.defineProperty(window, "scrollY", { value: 400, writable: true });
        fireEvent.scroll(window);

        fireEvent.click(screen.getByRole("button", { name: "page.scrollToTop" }));

        expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });
});
