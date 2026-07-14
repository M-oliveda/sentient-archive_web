import { render, screen, fireEvent } from "@testing-library/react";
import { StatsCard } from "@/components/dashboard/StatsCard";

const MockIcon = () => <svg data-testid="mock-icon" />;

describe("StatsCard", () => {
    it("renders label and numeric value", () => {
        render(<StatsCard icon={MockIcon} label="Tokens" value={2450} />);
        expect(screen.getByText("Tokens")).toBeInTheDocument();
        expect(screen.getByText("2,450")).toBeInTheDocument();
    });

    it("renders string value without formatting", () => {
        render(<StatsCard icon={MockIcon} label="Last Edited" value="My Note" />);
        expect(screen.getByText("My Note")).toBeInTheDocument();
    });

    it("renders action button when action prop is provided", () => {
        const onClick = jest.fn();
        render(
            <StatsCard
                icon={MockIcon}
                label="Tokens"
                value={100}
                action={{ label: "Request More", onClick }}
            />,
        );
        const btn = screen.getByText("Request More");
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not render action button when action is not provided", () => {
        render(<StatsCard icon={MockIcon} label="Notes" value={5} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders the icon", () => {
        render(<StatsCard icon={MockIcon} label="Notes" value={5} />);
        expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("applies default variant styling", () => {
        const { container } = render(
            <StatsCard icon={MockIcon} label="Notes" value={5} />,
        );
        expect(container.firstChild).toHaveClass("bg-muted");
    });

    it("applies accent variant styling", () => {
        const { container } = render(
            <StatsCard icon={MockIcon} label="Notes" value={5} variant="accent" />,
        );
        expect(container.firstChild).toHaveClass("bg-accent");
    });

    it("renders action button with accent styling when variant is accent", () => {
        const onClick = jest.fn();
        render(
            <StatsCard
                icon={MockIcon}
                label="Tokens"
                value={100}
                variant="accent"
                action={{ label: "Buy More", onClick }}
            />,
        );
        const btn = screen.getByText("Buy More");
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
