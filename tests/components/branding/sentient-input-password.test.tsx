import { render, screen, fireEvent } from "@testing-library/react";
import { SentientInputPassword } from "@/components/branding/sentient-input-password";

describe("SentientInputPassword", () => {
    it("should use the default password label", () => {
        render(<SentientInputPassword value="" onChange={() => {}} />);

        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should toggle password visibility", () => {
        render(
            <SentientInputPassword
                label="Password"
                value="Secret123!"
                onChange={() => {}}
            />,
        );

        const input = screen.getByLabelText("Password");
        const toggle = screen.getByRole("button", { name: "Show password" });

        expect(input).toHaveAttribute("type", "password");

        fireEvent.click(toggle);

        expect(input).toHaveAttribute("type", "text");
        expect(
            screen.getByRole("button", { name: "Hide password" }),
        ).toBeInTheDocument();
    });

    it("should support uncontrolled input changes", () => {
        render(<SentientInputPassword label="Password" />);

        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "Password123!" },
        });

        expect(screen.getByLabelText("Password")).toHaveValue("Password123!");
    });

    it("should render without label when label is empty", () => {
        render(<SentientInputPassword label="" showValidation rules={[]} />);

        expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    });

    it("should apply success validation styling", () => {
        render(
            <SentientInputPassword
                label="Password"
                value="Password123!"
                onChange={() => {}}
                validationState="success"
            />,
        );

        expect(screen.getByLabelText("Password")).not.toHaveAttribute("aria-invalid");
    });

    it("should mark invalid passwords when validation is shown", () => {
        render(
            <SentientInputPassword
                label="Password"
                value="weak"
                onChange={() => {}}
                showValidation
            />,
        );

        expect(screen.getByLabelText("Password")).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    });
});
