import { render, screen } from "@testing-library/react";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

describe("Alert", () => {
    it("should render default alert with title, description, and action", () => {
        render(
            <Alert>
                <AlertTitle>Alert title</AlertTitle>
                <AlertDescription>Alert description</AlertDescription>
                <AlertAction>Retry</AlertAction>
            </Alert>,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Alert title")).toBeInTheDocument();
        expect(screen.getByText("Alert description")).toBeInTheDocument();
        expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("should render destructive alert variant", () => {
        render(
            <Alert variant="destructive">
                <AlertDescription>Error message</AlertDescription>
            </Alert>,
        );

        expect(screen.getByText("Error message")).toBeInTheDocument();
    });
});
