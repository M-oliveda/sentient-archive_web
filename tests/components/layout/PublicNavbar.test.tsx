import { render, screen, fireEvent } from "@testing-library/react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

jest.mock("@tanstack/react-router", () => ({
    Link: ({
        to,
        onClick,
        children,
    }: {
        to: string;
        onClick?: () => void;
        children: React.ReactNode;
    }) => (
        <a href={to} onClick={onClick}>
            {children}
        </a>
    ),
}));

function getHamburgerButton() {
    return screen.getByRole("button", { name: "Open menu" });
}

function isMenuOpen() {
    return getHamburgerButton().getAttribute("aria-expanded") === "true";
}

describe("PublicNavbar", () => {
    it("renders brand name, desktop nav links, log in, and get started", () => {
        render(<PublicNavbar />);

        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Features").length).toBeGreaterThan(0);
        expect(screen.getAllByText("How it Works").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Token System").length).toBeGreaterThan(0);

        const getStartedLinks = screen.getAllByRole("link", {
            name: "Get Started",
        });
        expect(getStartedLinks[0]).toHaveAttribute("href", "/signup");

        const loginLinks = screen.getAllByRole("link", { name: "Log In" });
        expect(loginLinks[0]).toHaveAttribute("href", "/login");
    });

    it("renders hamburger button with aria-expanded false initially", () => {
        render(<PublicNavbar />);
        expect(getHamburgerButton()).toHaveAttribute("aria-expanded", "false");
    });

    it("opens mobile menu when hamburger button is clicked", () => {
        render(<PublicNavbar />);

        expect(isMenuOpen()).toBe(false);
        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);
    });

    it("closes mobile menu when X button is clicked", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when backdrop is clicked", () => {
        const { container } = render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const backdrop = container.querySelector(
            '[data-testid="mobile-menu-backdrop"]',
        );
        expect(backdrop).toBeInTheDocument();
        fireEvent.click(backdrop!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when a nav link is clicked", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const featureLinks = screen.getAllByRole("link", { name: /features/i });
        fireEvent.click(featureLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when panel logo link is clicked", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const logoLinks = screen.getAllByRole("link", {
            name: /SentientArchive/,
        });
        fireEvent.click(logoLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when footer Get Started is clicked", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const getStartedLinks = screen.getAllByRole("link", {
            name: "Get Started",
        });
        fireEvent.click(getStartedLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when footer Log In is clicked", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const loginLinks = screen.getAllByRole("link", { name: "Log In" });
        fireEvent.click(loginLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("sets body overflow hidden when menu is open and restores on close", () => {
        render(<PublicNavbar />);

        fireEvent.click(getHamburgerButton());
        expect(document.body.style.overflow).toBe("hidden");

        fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
        expect(document.body.style.overflow).toBe("");
    });
});
