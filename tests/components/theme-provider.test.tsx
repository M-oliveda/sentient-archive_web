import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";

describe("ThemeProvider", () => {
    it("should render children", () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <p>Theme content</p>
            </ThemeProvider>,
        );

        expect(screen.getByText("Theme content")).toBeInTheDocument();
    });
});
