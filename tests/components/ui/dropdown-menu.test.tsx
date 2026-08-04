import type React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@base-ui/react/menu", () => ({
    Menu: {
        Root: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu" {...props}>
                {children}
            </div>
        ),
        Portal: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu-portal" {...props}>
                {children}
            </div>
        ),
        Trigger: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <button type="button" data-slot="dropdown-menu-trigger" {...props}>
                {children}
            </button>
        ),
        Positioner: ({
            children,
            align: _align,
            alignOffset: _alignOffset,
            side: _side,
            sideOffset: _sideOffset,
            ...props
        }: {
            children?: React.ReactNode;
            align?: string;
            alignOffset?: number;
            side?: string;
            sideOffset?: number;
            [key: string]: unknown;
        }) => (
            <div data-testid="menu-positioner" {...props}>
                {children}
            </div>
        ),
        Popup: ({
            children,
            className,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu-content" className={className} {...props}>
                {children}
            </div>
        ),
        Group: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu-group" {...props}>
                {children}
            </div>
        ),
        GroupLabel: ({
            children,
            className,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu-label" className={className} {...props}>
                {children}
            </div>
        ),
        Item: ({
            children,
            className,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div
                role="menuitem"
                data-slot="dropdown-menu-item"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        SubmenuRoot: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-slot="dropdown-menu-sub" {...props}>
                {children}
            </div>
        ),
        SubmenuTrigger: ({
            children,
            className,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <button
                type="button"
                data-slot="dropdown-menu-sub-trigger"
                className={className}
                {...props}
            >
                {children}
            </button>
        ),
        CheckboxItem: ({
            children,
            className,
            checked,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            checked?: boolean;
            [key: string]: unknown;
        }) => (
            <div
                role="menuitemcheckbox"
                aria-checked={!!checked}
                data-slot="dropdown-menu-checkbox-item"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        CheckboxItemIndicator: ({ children }: { children?: React.ReactNode }) => (
            <span data-testid="checkbox-indicator">{children}</span>
        ),
        RadioGroup: ({
            children,
            ...props
        }: {
            children?: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div role="radiogroup" data-slot="dropdown-menu-radio-group" {...props}>
                {children}
            </div>
        ),
        RadioItem: ({
            children,
            className,
            ...props
        }: {
            children?: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div
                role="menuitemradio"
                data-slot="dropdown-menu-radio-item"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        RadioItemIndicator: ({ children }: { children?: React.ReactNode }) => (
            <span data-testid="radio-indicator">{children}</span>
        ),
        Separator: ({
            className,
            ...props
        }: {
            className?: string;
            [key: string]: unknown;
        }) => (
            <hr data-slot="dropdown-menu-separator" className={className} {...props} />
        ),
    },
}));

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu components", () => {
    it("renders root, trigger, portal, and content", () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <span>portal</span>
                </DropdownMenuPortal>
                <DropdownMenuContent className="custom-content">
                    <span>menu body</span>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        expect(
            document.querySelector('[data-slot="dropdown-menu"]'),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
        expect(screen.getByText("portal")).toBeInTheDocument();
        expect(screen.getByText("menu body")).toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="dropdown-menu-content"]'),
        ).toHaveClass("custom-content");
    });

    it("renders group, label, items, separator, and shortcut", () => {
        render(
            <DropdownMenu>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel inset className="label-class">
                            Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem inset variant="destructive">
                            Delete
                            <DropdownMenuShortcut className="shortcut-class">
                                ⌘D
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator className="sep-class" />
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        expect(screen.getByText("Actions")).toHaveAttribute("data-inset", "true");
        expect(screen.getByRole("menuitem", { name: /Delete/ })).toHaveAttribute(
            "data-variant",
            "destructive",
        );
        expect(screen.getByText("⌘D")).toHaveClass("shortcut-class");
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="dropdown-menu-separator"]'),
        ).toHaveClass("sep-class");
    });

    it("renders submenu trigger and content with defaults", () => {
        render(
            <DropdownMenuSub>
                <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="sub-content">
                    Nested
                </DropdownMenuSubContent>
            </DropdownMenuSub>,
        );

        expect(screen.getByRole("button", { name: "More" })).toHaveAttribute(
            "data-inset",
            "true",
        );
        expect(screen.getByText("Nested")).toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="dropdown-menu-sub-content"]'),
        ).toHaveClass("sub-content");
    });

    it("renders checkbox and radio items", () => {
        render(
            <DropdownMenu>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem checked inset>
                        Show sidebar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuRadioGroup>
                        <DropdownMenuRadioItem value="a" inset>
                            Option A
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        expect(
            screen.getByRole("menuitemcheckbox", { name: "Show sidebar" }),
        ).toHaveAttribute("aria-checked", "true");
        expect(screen.getByTestId("checkbox-indicator")).toBeInTheDocument();
        expect(screen.getByRole("radiogroup")).toBeInTheDocument();
        expect(
            screen.getByRole("menuitemradio", { name: "Option A" }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("radio-indicator")).toBeInTheDocument();
    });
});
