import { render, screen } from "@testing-library/react";
import { TokenSystemSection } from "@/components/landing/TokenSystemSection";

/** Cost cards render in both the mobile carousel and the desktop grid. */
const COST_LAYOUT_COUNT = 2;

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
        expect(screen.getAllByText("tokens.costs.autoTagging.label")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.autoTagging.cost")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.summarization.label")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.summarization.cost")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.flashcards.label")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.qaChat.label")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
        expect(screen.getAllByText("tokens.costs.qaChat.cost")).toHaveLength(
            COST_LAYOUT_COUNT,
        );
    });

    it("renders a mobile carousel with navigation controls", () => {
        render(<TokenSystemSection />);

        expect(document.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
        expect(screen.getByText("Previous slide")).toBeInTheDocument();
        expect(screen.getByText("Next slide")).toBeInTheDocument();
        expect(document.querySelectorAll('[data-slot="carousel-item"]').length).toBe(4);
    });

    it("has the token-system anchor id", () => {
        const { container } = render(<TokenSystemSection />);
        expect(container.querySelector("#token-system")).toBeInTheDocument();
    });
});
