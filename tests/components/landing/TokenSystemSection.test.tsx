import { render, screen } from "@testing-library/react";
import { TokenSystemSection } from "@/components/landing/TokenSystemSection";

describe("TokenSystemSection", () => {
    it("renders the section heading", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText("tokens.title")).toBeInTheDocument();
    });

    it("renders the free tokens explanation", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText("tokens.freeStartHighlight")).toBeInTheDocument();
    });

    it("renders all four token cost cards", () => {
        render(<TokenSystemSection />);
        expect(screen.getByText("tokens.costs.autoTagging.label")).toBeInTheDocument();
        expect(screen.getByText("tokens.costs.autoTagging.cost")).toBeInTheDocument();
        expect(
            screen.getByText("tokens.costs.summarization.label"),
        ).toBeInTheDocument();
        expect(screen.getByText("tokens.costs.summarization.cost")).toBeInTheDocument();
        expect(screen.getByText("tokens.costs.flashcards.label")).toBeInTheDocument();
        expect(screen.getByText("tokens.costs.qaChat.label")).toBeInTheDocument();
        expect(screen.getByText("tokens.costs.qaChat.cost")).toBeInTheDocument();
    });

    it("has the token-system anchor id", () => {
        const { container } = render(<TokenSystemSection />);
        expect(container.querySelector("#token-system")).toBeInTheDocument();
    });
});
