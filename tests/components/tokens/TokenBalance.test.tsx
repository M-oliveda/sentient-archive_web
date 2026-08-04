import { render, screen } from "@testing-library/react";
import { TokenBalance } from "@/components/tokens/TokenBalance";

describe("TokenBalance", () => {
    it("renders balance and max balance", () => {
        render(<TokenBalance balance={1500} />);
        expect(screen.getByTestId("token-balance-value")).toHaveTextContent("1,500");
        expect(screen.getByText("balanceCard.ofMax")).toBeInTheDocument();
    });

    it("renders custom maxBalance", () => {
        render(<TokenBalance balance={100} maxBalance={1000} />);
        expect(screen.getByText("balanceCard.ofMax")).toBeInTheDocument();
    });

    it("applies error color class when balance is below lowThreshold", () => {
        render(<TokenBalance balance={10} />);
        const value = screen.getByTestId("token-balance-value");
        expect(value.className).toContain("text-[hsl(var(--error))]");
    });

    it("applies warning color class when balance is between lowThreshold and warningThreshold", () => {
        render(<TokenBalance balance={50} />);
        const value = screen.getByTestId("token-balance-value");
        expect(value.className).toContain("text-[hsl(var(--warning))]");
    });

    it("applies foreground color class when balance is above warningThreshold", () => {
        render(<TokenBalance balance={200} />);
        const value = screen.getByTestId("token-balance-value");
        expect(value.className).toContain("text-foreground");
    });

    it("shows critically low warning message when balance is below lowThreshold", () => {
        render(<TokenBalance balance={5} />);
        expect(screen.getByText("balanceCard.criticallyLow")).toBeInTheDocument();
    });

    it("shows running low warning message when balance is in warning range", () => {
        render(<TokenBalance balance={50} />);
        expect(screen.getByText("balanceCard.runningLow")).toBeInTheDocument();
    });

    it("shows no warning message when balance is healthy", () => {
        render(<TokenBalance balance={500} />);
        expect(screen.queryByText("balanceCard.criticallyLow")).not.toBeInTheDocument();
        expect(screen.queryByText("balanceCard.runningLow")).not.toBeInTheDocument();
    });

    it("respects custom lowThreshold", () => {
        render(<TokenBalance balance={30} lowThreshold={50} />);
        const value = screen.getByTestId("token-balance-value");
        expect(value.className).toContain("text-[hsl(var(--error))]");
    });

    it("respects custom warningThreshold", () => {
        render(<TokenBalance balance={150} warningThreshold={200} />);
        const value = screen.getByTestId("token-balance-value");
        expect(value.className).toContain("text-[hsl(var(--warning))]");
    });

    it("applies custom className", () => {
        const { container } = render(
            <TokenBalance balance={100} className="my-custom-class" />,
        );
        expect(container.firstChild).toHaveClass("my-custom-class");
    });

    it("renders a progress bar element", () => {
        render(<TokenBalance balance={2500} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
});
