import { render, screen } from "@testing-library/react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

describe("Pagination", () => {
    it("renders navigation shell with content and items", () => {
        render(
            <Pagination className="custom-pagination">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink>1</PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>,
        );

        expect(screen.getByRole("navigation", { name: "pagination" })).toHaveClass(
            "custom-pagination",
        );
        expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    });

    it("renders active and inactive pagination links", () => {
        render(
            <>
                <PaginationLink isActive aria-label="Page 1">
                    1
                </PaginationLink>
                <PaginationLink aria-label="Page 2">2</PaginationLink>
            </>,
        );

        expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute(
            "data-active",
            "true",
        );
        expect(screen.getByRole("button", { name: "Page 2" })).not.toHaveAttribute(
            "aria-current",
        );
    });

    it("renders previous and next controls with custom text", () => {
        render(
            <>
                <PaginationPrevious text="Back" />
                <PaginationNext text="Forward" />
            </>,
        );

        expect(
            screen.getByRole("button", { name: "Go to previous page" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Back")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Go to next page" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Forward")).toBeInTheDocument();
    });

    it("renders previous and next with default text", () => {
        render(
            <>
                <PaginationPrevious />
                <PaginationNext />
            </>,
        );

        expect(screen.getByText("Previous")).toBeInTheDocument();
        expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("renders ellipsis with accessible label", () => {
        render(<PaginationEllipsis className="custom-ellipsis" />);

        expect(screen.getByText("More pages")).toBeInTheDocument();
        expect(document.querySelector('[data-slot="pagination-ellipsis"]')).toHaveClass(
            "custom-ellipsis",
        );
    });
});
