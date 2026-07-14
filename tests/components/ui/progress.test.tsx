import { render, screen } from "@testing-library/react";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

describe("Progress", () => {
    it("renders progressbar with correct value", () => {
        render(<Progress value={50} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders ProgressLabel", () => {
        render(
            <Progress value={50}>
                <ProgressLabel>Loading</ProgressLabel>
            </Progress>,
        );
        expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("renders ProgressValue", () => {
        render(
            <Progress value={50}>
                <ProgressValue>{() => "50%"}</ProgressValue>
            </Progress>,
        );
        expect(screen.getByText("50%")).toBeInTheDocument();
    });
});
