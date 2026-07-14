import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/pages/landing/LandingPage";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("LandingPage", () => {
    it("renders the public navbar brand", () => {
        render(<LandingPage />);
        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
    });

    it("renders the hero section", () => {
        render(<LandingPage />);
        expect(screen.getByText("v1.0 is now live")).toBeInTheDocument();
    });

    it("renders the Why SentientArchive section", () => {
        render(<LandingPage />);
        expect(screen.getByText("Why SentientArchive?")).toBeInTheDocument();
    });

    it("renders the Features section", () => {
        render(<LandingPage />);
        expect(
            screen.getByText(/Everything You Need to Build Your Knowledge Empire/),
        ).toBeInTheDocument();
    });

    it("renders the How It Works section", () => {
        render(<LandingPage />);
        expect(screen.getByText("How It Works")).toBeInTheDocument();
    });

    it("renders the Token System section", () => {
        render(<LandingPage />);
        expect(screen.getByText("Simple Token-Based System")).toBeInTheDocument();
    });

    it("renders the footer", () => {
        render(<LandingPage />);
        expect(screen.getByText(/© 2025 SentientArchive/)).toBeInTheDocument();
    });
});
