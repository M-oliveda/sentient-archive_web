import { render, screen } from "@testing-library/react";
import { LandingFooter } from "@/components/landing/LandingFooter";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("LandingFooter", () => {
    it("renders the brand name", () => {
        render(<LandingFooter />);
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });

    it("renders the copyright notice", () => {
        render(<LandingFooter />);
        expect(screen.getByText(/© 2025 SentientArchive/)).toBeInTheDocument();
    });

    it("renders the tagline", () => {
        render(<LandingFooter />);
        expect(screen.getByText(/AI-Powered Knowledge OS/)).toBeInTheDocument();
    });
});
