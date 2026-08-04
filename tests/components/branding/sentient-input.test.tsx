import { render, screen, fireEvent } from "@testing-library/react";
import { Mail } from "lucide-react";
import { SentientInput } from "@/components/branding/sentient-input";

describe("SentientInput", () => {
    it("should toggle password visibility", () => {
        render(
            <SentientInput
                label="Password"
                type="password"
                value="secret"
                onChange={() => {}}
            />,
        );

        const input = screen.getByLabelText("Password");
        const toggle = screen.getByRole("button", { name: "Show password" });

        expect(input).toHaveAttribute("type", "password");

        fireEvent.click(toggle);

        expect(input).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );

        fireEvent.click(screen.getByRole("button", { name: "Hide password" }));

        expect(input).toHaveAttribute("type", "password");
    });

    it("should not show toggle for non-password inputs", () => {
        render(
            <SentientInput
                label="Email"
                type="email"
                value="test@example.com"
                onChange={() => {}}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Show password" }),
        ).not.toBeInTheDocument();
    });

    it("should position validation icons beside password toggle", () => {
        const { rerender } = render(
            <SentientInput
                label="Password"
                type="password"
                validationState="error"
                errorMessage="Invalid password"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Show password" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Invalid password")).toBeInTheDocument();

        rerender(
            <SentientInput
                label="Password"
                type="password"
                validationState="success"
                successMessage="Looks good"
            />,
        );

        expect(screen.getByText("Looks good")).toBeInTheDocument();
    });

    it("should render icon with validation states on non-password inputs", () => {
        const { rerender } = render(
            <SentientInput
                label="Email"
                type="email"
                icon={Mail}
                validationState="idle"
            />,
        );

        expect(screen.getByLabelText("Email")).toBeInTheDocument();

        rerender(
            <SentientInput
                label="Email"
                type="email"
                icon={Mail}
                validationState="error"
                errorMessage="Invalid email"
            />,
        );

        expect(screen.getByText("Invalid email")).toBeInTheDocument();

        rerender(
            <SentientInput
                label="Email"
                type="email"
                icon={Mail}
                validationState="success"
                successMessage="Valid email"
            />,
        );

        expect(screen.getByText("Valid email")).toBeInTheDocument();
    });

    it("should render without label and use idle password padding", () => {
        const { container } = render(
            <SentientInput type="password" id="password-field" />,
        );

        expect(container.querySelector("#password-field")).toHaveAttribute(
            "type",
            "password",
        );
        expect(
            screen.getByRole("button", { name: "Show password" }),
        ).toBeInTheDocument();
    });

    it("should omit validation messages when not provided", () => {
        const { container } = render(
            <SentientInput label="Email" type="email" validationState="error" />,
        );

        expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });
});
