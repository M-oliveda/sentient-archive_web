import { render, screen, fireEvent } from "@testing-library/react";
import { TermsAndPrivacyPage } from "@/pages/legal/TermsAndPrivacyPage";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
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

        expect(
            screen.getByText("Terms of Service & Privacy Policy"),
        ).toBeInTheDocument();
        expect(screen.getByText("Legal Documentation")).toBeInTheDocument();
        expect(screen.getByText("1. Introduction")).toBeInTheDocument();
        expect(screen.getByText("hello@moliveda.dev")).toBeInTheDocument();
        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
    });

    it("should show scroll-to-top button after scrolling down", () => {
        render(<TermsAndPrivacyPage />);

        expect(
            screen.queryByRole("button", { name: "Scroll to top" }),
        ).not.toBeInTheDocument();

        Object.defineProperty(window, "scrollY", { value: 400, writable: true });
        fireEvent.scroll(window);

        expect(
            screen.getByRole("button", { name: "Scroll to top" }),
        ).toBeInTheDocument();
    });

    it("should scroll to top when button is clicked", () => {
        const scrollToMock = jest.fn();
        window.scrollTo = scrollToMock;

        render(<TermsAndPrivacyPage />);

        Object.defineProperty(window, "scrollY", { value: 400, writable: true });
        fireEvent.scroll(window);

        fireEvent.click(screen.getByRole("button", { name: "Scroll to top" }));

        expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });
});
