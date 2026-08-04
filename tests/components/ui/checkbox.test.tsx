import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
    it("should render checkbox with label", () => {
        render(<Checkbox aria-label="Accept terms" />);

        expect(
            screen.getByRole("checkbox", { name: "Accept terms" }),
        ).toBeInTheDocument();
    });
});
