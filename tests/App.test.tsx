import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App", () => {
    test("renders the app title", () => {
        render(<App />);

        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
        expect(screen.getByText("Personal Knowledge Base")).toBeInTheDocument();
    });
});
