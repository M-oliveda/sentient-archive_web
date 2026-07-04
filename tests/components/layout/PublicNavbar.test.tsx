import { render, screen } from "@testing-library/react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("PublicNavbar", () => {
    it("should render brand, navigation links, and get started button", () => {
        render(<PublicNavbar />);

        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
        expect(screen.getByText("Features")).toBeInTheDocument();
        expect(screen.getByText("How it Works")).toBeInTheDocument();
        expect(screen.getByText("Token System")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
            "href",
            "/signup",
        );
    });
});
