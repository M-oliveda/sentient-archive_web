import { render, screen } from "@testing-library/react";
import { TokenSystemSection } from "@/components/landing/TokenSystemSection";

describe("TokenSystemSection", () => {
    it("renders the section heading", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText("Simple Token-Based System")).toBeInTheDocument();
    });

    it("renders the free tokens explanation", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText(/20 free/)).toBeInTheDocument();
    });

    it("renders all four token cost cards", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText("Auto-Tagging")).toBeInTheDocument();
        expect(screen.getByText("1 token")).toBeInTheDocument();
        expect(screen.getByText("Summarization")).toBeInTheDocument();
        expect(screen.getByText("2 tokens")).toBeInTheDocument();
        expect(screen.getByText("Flashcards")).toBeInTheDocument();
        expect(screen.getByText("Q&A Chat")).toBeInTheDocument();
        expect(screen.getByText("4 tokens per query")).toBeInTheDocument();
    });

    it("has the token-system anchor id", () => {
        const { container } = render(<TokenSystemSection />);
        expect(container.querySelector("#token-system")).toBeInTheDocument();
    });
});
