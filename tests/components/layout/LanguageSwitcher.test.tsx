/**
 * LanguageSwitcher Component Tests
 */

import type React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
const mockUpdateLanguage = jest.fn();
let mockCurrentLanguage = "en";
let mockIsAuthenticated = false;

jest.mock("@/hooks/useLanguage", () => ({
    useLanguage: () => ({
        currentLanguage: mockCurrentLanguage,
        supportedLanguages: [
            { code: "en", name: "English" },
            { code: "es", name: "Español" },
            { code: "fr", name: "Français" },
            { code: "pt", name: "Português" },
        ],
        changeLanguage: mockChangeLanguage,
    }),
}));

jest.mock("@/hooks/useUpdateLanguage", () => ({
    useUpdateLanguage: () => ({
        mutate: mockUpdateLanguage,
    }),
}));

jest.mock("@/stores/authStore", () => ({
    useAuthStore: () => ({
        isAuthenticated: mockIsAuthenticated,
    }),
}));

jest.mock("@/components/ui/dropdown-menu", () => {
    function DropdownMenu({ children }: { children: React.ReactNode }) {
        return <div data-testid="dropdown-menu">{children}</div>;
    }

    function DropdownMenuTrigger({
        children,
        render,
        ...props
    }: {
        children?: React.ReactNode;
        render?: React.ReactElement;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
        if (render) {
            const { cloneElement: mockCloneElement } = jest.requireActual("react") as {
                cloneElement: typeof React.cloneElement;
            };
            return mockCloneElement(render, props, children);
        }
        return (
            <button type="button" {...props}>
                {children}
            </button>
        );
    }

    function DropdownMenuContent({ children }: { children: React.ReactNode }) {
        return <div role="menu">{children}</div>;
    }

    function DropdownMenuItem({
        children,
        onClick,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
    }) {
        return (
            <button
                type="button"
                role="menuitem"
                className={className}
                onClick={onClick}
            >
                {children}
            </button>
        );
    }

    return {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
    };
});

describe("LanguageSwitcher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentLanguage = "en";
        mockIsAuthenticated = false;
    });

    test("renders language switcher button", () => {
        render(<LanguageSwitcher />);
        const button = screen.getByRole("button", { name: /selectLanguage/i });
        expect(button).toBeInTheDocument();
    });

    test("displays the selected language flag on the button", () => {
        render(<LanguageSwitcher />);
        const flag = screen.getByRole("img", { name: "English" });
        expect(flag).toBeInTheDocument();
        expect(flag.tagName.toLowerCase()).toBe("svg");
    });

    test("highlights the currently selected language option", () => {
        render(<LanguageSwitcher />);
        expect(screen.getByRole("menuitem", { name: "English" })).toHaveClass(
            "bg-accent",
        );
        expect(screen.getByRole("menuitem", { name: "Español" })).not.toHaveClass(
            "bg-accent",
        );
    });

    test("resolves regional locales to a supported base language", () => {
        mockCurrentLanguage = "es-MX";
        render(<LanguageSwitcher />);
        expect(screen.getByRole("img", { name: "Español" })).toBeInTheDocument();
        expect(screen.getByRole("menuitem", { name: "Español" })).toHaveClass(
            "bg-accent",
        );
    });

    test("falls back to English for unsupported languages", () => {
        mockCurrentLanguage = "de";
        render(<LanguageSwitcher />);
        expect(screen.getByRole("img", { name: "English" })).toBeInTheDocument();
    });

    test("changes language without persisting when unauthenticated", async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        await user.click(screen.getByRole("menuitem", { name: "Español" }));

        expect(mockChangeLanguage).toHaveBeenCalledWith("es");
        expect(mockUpdateLanguage).not.toHaveBeenCalled();
    });

    test("persists language preference when authenticated", async () => {
        mockIsAuthenticated = true;
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        await user.click(screen.getByRole("menuitem", { name: "Français" }));

        expect(mockChangeLanguage).toHaveBeenCalledWith("fr");
        expect(mockUpdateLanguage).toHaveBeenCalledWith({ language: "fr" });
    });
});
