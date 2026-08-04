import { render, screen } from "@testing-library/react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

describe("Table", () => {
    it("renders table structure including footer and caption", () => {
        render(
            <Table containerClassName="custom-container" className="custom-table">
                <TableCaption>Users summary</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Alice</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>Total: 1</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>,
        );

        expect(screen.getByRole("table")).toHaveClass("custom-table");
        expect(document.querySelector('[data-slot="table-container"]')).toHaveClass(
            "custom-container",
        );
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Total: 1")).toBeInTheDocument();
        expect(screen.getByText("Users summary")).toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="table-footer"]'),
        ).toBeInTheDocument();
        expect(
            document.querySelector('[data-slot="table-caption"]'),
        ).toBeInTheDocument();
    });
});
