import { render, screen } from "@testing-library/react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

describe("Card", () => {
    it("should render all card subcomponents including action", () => {
        render(
            <Card size="sm">
                <CardHeader>
                    <CardTitle>Card title</CardTitle>
                    <CardDescription>Card description</CardDescription>
                    <CardAction>Edit</CardAction>
                </CardHeader>
                <CardContent>Card content</CardContent>
                <CardFooter>Card footer</CardFooter>
            </Card>,
        );

        expect(screen.getByText("Card title")).toBeInTheDocument();
        expect(screen.getByText("Card description")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Card content")).toBeInTheDocument();
        expect(screen.getByText("Card footer")).toBeInTheDocument();
    });
});
