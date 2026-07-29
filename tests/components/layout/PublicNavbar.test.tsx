import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function renderNavbar() {
    const Wrapper = createWrapper();
    return render(
        <Wrapper>
            <PublicNavbar />
        </Wrapper>,
    );
}

function getHamburgerButton() {
    return screen.getByRole("button", { name: "nav.openMenu" });
}

function isMenuOpen() {
    return getHamburgerButton().getAttribute("aria-expanded") === "true";
}

describe("PublicNavbar", () => {
    it("renders brand name, desktop nav links, log in, and get started", () => {
        renderNavbar();

        expect(screen.getAllByText("SentientArchive").length).toBeGreaterThan(0);
        expect(screen.getAllByText("nav.features").length).toBeGreaterThan(0);
        expect(screen.getAllByText("nav.howItWorks").length).toBeGreaterThan(0);
        expect(screen.getAllByText("nav.tokenSystem").length).toBeGreaterThan(0);

        const getStartedLinks = screen.getAllByRole("link", {
            name: "nav.getStarted",
        });
        expect(getStartedLinks[0]).toHaveAttribute("href", "/signup");

        const loginLinks = screen.getAllByRole("link", { name: "nav.logIn" });
        expect(loginLinks[0]).toHaveAttribute("href", "/login");
    });

    it("renders hamburger button with aria-expanded false initially", () => {
        renderNavbar();
        expect(getHamburgerButton()).toHaveAttribute("aria-expanded", "false");
    });

    it("opens mobile menu when hamburger button is clicked", () => {
        renderNavbar();

        expect(isMenuOpen()).toBe(false);
        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);
    });

    it("closes mobile menu when X button is clicked", () => {
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "nav.closeMenu" }));
        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when backdrop is clicked", () => {
        const { container } = renderNavbar();

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
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const featureLinks = screen.getAllByRole("link", { name: /nav.features/i });
        fireEvent.click(featureLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when panel logo link is clicked", () => {
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const logoLinks = screen.getAllByRole("link", {
            name: /SentientArchive/,
        });
        fireEvent.click(logoLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when footer Get Started is clicked", () => {
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const getStartedLinks = screen.getAllByRole("link", {
            name: "nav.getStarted",
        });
        fireEvent.click(getStartedLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("closes mobile menu when footer Log In is clicked", () => {
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(isMenuOpen()).toBe(true);

        const loginLinks = screen.getAllByRole("link", { name: "nav.logIn" });
        fireEvent.click(loginLinks.at(-1)!);

        expect(isMenuOpen()).toBe(false);
    });

    it("sets body overflow hidden when menu is open and restores on close", () => {
        renderNavbar();

        fireEvent.click(getHamburgerButton());
        expect(document.body.style.overflow).toBe("hidden");

        fireEvent.click(screen.getByRole("button", { name: "nav.closeMenu" }));
        expect(document.body.style.overflow).toBe("");
    });
});
