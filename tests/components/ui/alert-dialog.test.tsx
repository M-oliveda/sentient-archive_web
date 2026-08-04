import type React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@base-ui/react/alert-dialog", () => ({
    AlertDialog: {
        Root: ({
            children,
            ...props
        }: {
            children: React.ReactNode;
            [key: string]: unknown;
        }) => (
            <div data-testid="alert-dialog-root" {...props}>
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
            <button data-testid="alert-dialog-trigger" {...props}>
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
        }) => (
            <div data-testid="alert-dialog-backdrop" className={className} {...props} />
        ),
        Popup: ({
            children,
            className,
            ...props
        }: {
            children: React.ReactNode;
            className?: string;
            [key: string]: unknown;
        }) => (
            <div data-testid="alert-dialog-popup" className={className} {...props}>
                {children}
            </div>
        ),
        Title: ({
            children,
            className,
        }: {
            children: React.ReactNode;
            className?: string;
        }) => (
            <h2 data-testid="alert-dialog-title" className={className}>
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
            <p data-testid="alert-dialog-desc" className={className}>
                {children}
            </p>
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
                return mockCloneElement(renderProp, {
                    className,
                    children,
                    ...rest,
                });
            }
            return (
                <button className={className} {...rest}>
                    {children}
                </button>
            );
        },
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

describe("AlertDialog components", () => {
    it("AlertDialog renders children", () => {
        render(
            <AlertDialog>
                <span>child</span>
            </AlertDialog>,
        );
        expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("AlertDialogTrigger renders", () => {
        render(<AlertDialogTrigger />);
        expect(screen.getByTestId("alert-dialog-trigger")).toBeInTheDocument();
    });

    it("AlertDialogPortal renders children", () => {
        render(
            <AlertDialogPortal>
                <span>portal child</span>
            </AlertDialogPortal>,
        );
        expect(screen.getByText("portal child")).toBeInTheDocument();
    });

    it("AlertDialogOverlay renders with className", () => {
        render(<AlertDialogOverlay className="custom-class" />);
        expect(screen.getByTestId("alert-dialog-backdrop")).toBeInTheDocument();
    });

    it("AlertDialogContent renders with default size", () => {
        render(
            <AlertDialogContent>
                <span>content</span>
            </AlertDialogContent>,
        );
        expect(screen.getByTestId("alert-dialog-popup")).toBeInTheDocument();
        expect(screen.getByTestId("alert-dialog-popup")).toHaveAttribute(
            "data-size",
            "default",
        );
        expect(screen.getByText("content")).toBeInTheDocument();
    });

    it("AlertDialogContent renders with sm size", () => {
        render(
            <AlertDialogContent size="sm">
                <span>sm content</span>
            </AlertDialogContent>,
        );
        expect(screen.getByTestId("alert-dialog-popup")).toHaveAttribute(
            "data-size",
            "sm",
        );
    });

    it("AlertDialogHeader renders children", () => {
        render(
            <AlertDialogHeader>
                <span>header</span>
            </AlertDialogHeader>,
        );
        expect(screen.getByText("header")).toBeInTheDocument();
    });

    it("AlertDialogFooter renders children", () => {
        render(
            <AlertDialogFooter>
                <span>footer</span>
            </AlertDialogFooter>,
        );
        expect(screen.getByText("footer")).toBeInTheDocument();
    });

    it("AlertDialogMedia renders children", () => {
        render(
            <AlertDialogMedia>
                <span>media</span>
            </AlertDialogMedia>,
        );
        expect(screen.getByText("media")).toBeInTheDocument();
    });

    it("AlertDialogTitle renders children", () => {
        render(<AlertDialogTitle>Title text</AlertDialogTitle>);
        expect(screen.getByTestId("alert-dialog-title")).toBeInTheDocument();
        expect(screen.getByText("Title text")).toBeInTheDocument();
    });

    it("AlertDialogDescription renders children", () => {
        render(<AlertDialogDescription>Desc text</AlertDialogDescription>);
        expect(screen.getByTestId("alert-dialog-desc")).toBeInTheDocument();
        expect(screen.getByText("Desc text")).toBeInTheDocument();
    });

    it("AlertDialogAction renders as a button and fires onClick", async () => {
        const onClick = jest.fn();
        render(<AlertDialogAction onClick={onClick}>Confirm</AlertDialogAction>);
        await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("AlertDialogCancel renders via the Close render prop and shows children", () => {
        render(<AlertDialogCancel>Cancel</AlertDialogCancel>);
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("AlertDialogCancel uses outline variant by default", () => {
        render(<AlertDialogCancel>Cancel</AlertDialogCancel>);
        expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
            "data-variant",
            "outline",
        );
    });
});
