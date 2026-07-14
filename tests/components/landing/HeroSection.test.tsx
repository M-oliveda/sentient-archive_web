import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing/HeroSection";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("HeroSection", () => {
    it("renders the version badge", () => {
        render(<HeroSection />);
        expect(screen.getByText("v1.0 is now live")).toBeInTheDocument();
    });

    it("renders the headline", () => {
        render(<HeroSection />);
        expect(screen.getByText(/Unlock the wisdom in/)).toBeInTheDocument();
    });

    it("renders Start for Free CTA linking to /signup", () => {
        render(<HeroSection />);
        const link = screen.getByRole("link", { name: "Start for Free" });
        expect(link).toHaveAttribute("href", "/signup");
    });

    it("renders the dashboard preview", () => {
        render(<HeroSection />);
        expect(screen.getByTestId("dashboard-preview")).toBeInTheDocument();
    });
});
