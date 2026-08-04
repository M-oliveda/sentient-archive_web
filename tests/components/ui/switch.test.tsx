import type React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@base-ui/react/switch", () => ({
    Switch: {
        Root: ({
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
                role="switch"
                data-slot="switch"
                className={className}
                {...props}
            >
                {children}
            </button>
        ),
        Thumb: ({
            className,
            ...props
        }: {
            className?: string;
            [key: string]: unknown;
        }) => <span data-slot="switch-thumb" className={className} {...props} />,
    },
}));

import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
    it("renders root and thumb with custom className", () => {
        render(<Switch className="custom-switch" aria-label="Enable feature" />);

        const root = screen.getByRole("switch", { name: "Enable feature" });
        expect(root).toBeInTheDocument();
        expect(root).toHaveClass("custom-switch");
        expect(root.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument();
    });
});
