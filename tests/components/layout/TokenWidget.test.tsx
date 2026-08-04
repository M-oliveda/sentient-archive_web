import { render, screen } from "@testing-library/react";
import { TokenWidget } from "@/components/layout/TokenWidget";

describe("TokenWidget", () => {
    it("renders balance and default max balance", () => {
        render(<TokenWidget balance={2500} />);
        expect(screen.getByText(/2,500/)).toBeInTheDocument();
        expect(screen.getByText(/5,000/)).toBeInTheDocument();
    });

    it("renders custom max balance", () => {
        render(<TokenWidget balance={100} maxBalance={1000} />);
        expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });

    it("renders progressbar with correct aria attributes", () => {
        render(<TokenWidget balance={2500} maxBalance={5000} />);
        const bar = screen.getByRole("progressbar");
        expect(bar).toHaveAttribute("aria-valuenow", "2500");
        expect(bar).toHaveAttribute("aria-valuemin", "0");
        expect(bar).toHaveAttribute("aria-valuemax", "5000");
    });

    it("caps progress percentage at 100 when balance exceeds max", () => {
        render(<TokenWidget balance={6000} maxBalance={5000} />);
        const bar = screen.getByRole("progressbar");
        expect(bar).toBeInTheDocument();
    });

    it("renders Tokens label", () => {
        render(<TokenWidget balance={0} />);
        expect(screen.getByText("Tokens")).toBeInTheDocument();
    });
});
