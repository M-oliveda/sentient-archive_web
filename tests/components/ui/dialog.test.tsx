import type React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@base-ui/react/dialog", () => ({
    Dialog: {
        Root: ({
            children,
            ...props
        }: {
            children: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-testid="dialog-root" {...props}>
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
            <button data-testid="dialog-trigger" {...props}>
                {children}
            </button>
        ),
        Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Backdrop: ({
            className,
            ...props
        }: {
            className?: string;
            [key: string]: unknown;
        }) => <div data-testid="dialog-overlay" className={className} {...props} />,
        Popup: ({
            children,
            className,
            ...props
        }: {
            children: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div data-testid="dialog-popup" className={className} {...props}>
                {children}
            </div>
        ),
        Close: ({
            children,
            render: renderProp,
            className,
            ...rest
        }: {
            children?: React.ReactNode;
            render?: React.ReactElement<Record<string, unknown>>;
            className?: string;
            [key: string]: unknown;
        }) => {
            if (renderProp) {
                const { cloneElement: mockCloneElement } = jest.requireActual(
                    "react",
                ) as { cloneElement: typeof React.cloneElement };
                return mockCloneElement(renderProp, { className, children, ...rest });
            }
            return (
                <button className={className} {...rest}>
                    {children}
                </button>
            );
        },
        Title: ({
            children,
            className,
        }: {
            children: React.ReactNode;
            className?: string;
        }) => (
            <h2 data-testid="dialog-title" className={className}>
                {children}
            </h2>
        ),
        Description: ({
            children,
            className,
        }: {
            children: React.ReactNode;
            className?: string;
        }) => (
            <p data-testid="dialog-desc" className={className}>
                {children}
            </p>
        ),
    },
}));

jest.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        className,
        onClick,
        variant,
        size,
        ...props
    }: {
        children?: React.ReactNode;
        className?: string;
        onClick?: () => void;
        variant?: string;
        size?: string;
        [key: string]: unknown;
    }) => (
        <button
            className={className}
            onClick={onClick}
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {children}
        </button>
    ),
}));

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

describe("Dialog components", () => {
    it("Dialog renders children", () => {
        render(
            <Dialog>
                <span>child</span>
            </Dialog>,
        );
        expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("DialogTrigger renders", () => {
        render(<DialogTrigger />);
        expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
    });

    it("DialogPortal renders children", () => {
        render(
            <DialogPortal>
                <span>portal child</span>
            </DialogPortal>,
        );
        expect(screen.getByText("portal child")).toBeInTheDocument();
    });

    it("DialogClose renders", () => {
        render(<DialogClose>Close me</DialogClose>);
        expect(screen.getByRole("button", { name: "Close me" })).toBeInTheDocument();
    });

    it("DialogOverlay renders with className", () => {
        render(<DialogOverlay className="custom-class" />);
        expect(screen.getByTestId("dialog-overlay")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-overlay")).toHaveClass("custom-class");
    });

    it("DialogContent renders children and the sr-only close button by default", () => {
        render(
            <DialogContent>
                <span>content</span>
            </DialogContent>,
        );
        expect(screen.getByTestId("dialog-popup")).toBeInTheDocument();
        expect(screen.getByText("content")).toBeInTheDocument();
        expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("DialogContent does not render close button when showCloseButton=false", () => {
        render(
            <DialogContent showCloseButton={false}>
                <span>content</span>
            </DialogContent>,
        );
        expect(screen.getByTestId("dialog-popup")).toBeInTheDocument();
        expect(screen.queryByText("Close")).not.toBeInTheDocument();
    });

    it("DialogHeader renders children", () => {
        render(
            <DialogHeader>
                <span>header</span>
            </DialogHeader>,
        );
        expect(screen.getByText("header")).toBeInTheDocument();
    });

    it("DialogFooter renders children without a close button by default", () => {
        render(
            <DialogFooter>
                <span>footer</span>
            </DialogFooter>,
        );
        expect(screen.getByText("footer")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("DialogFooter renders a close button when showCloseButton=true", () => {
        render(
            <DialogFooter showCloseButton={true}>
                <span>footer</span>
            </DialogFooter>,
        );
        expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("DialogTitle renders children", () => {
        render(<DialogTitle>Title text</DialogTitle>);
        expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
        expect(screen.getByText("Title text")).toBeInTheDocument();
    });

    it("DialogDescription renders children", () => {
        render(<DialogDescription>Desc text</DialogDescription>);
        expect(screen.getByTestId("dialog-desc")).toBeInTheDocument();
        expect(screen.getByText("Desc text")).toBeInTheDocument();
    });
});
