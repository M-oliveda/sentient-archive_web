import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
    it("renders with data-slot skeleton", () => {
        const { container } = render(<Skeleton className="h-4 w-20" />);
        const el = container.querySelector('[data-slot="skeleton"]');
        expect(el).toBeInTheDocument();
        expect(el).toHaveClass("animate-pulse");
    });
});
