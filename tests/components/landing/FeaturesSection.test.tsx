import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

describe("FeaturesSection", () => {
    it("renders the section heading", () => {
        render(<FeaturesSection />);
        expect(screen.getByText("features.title")).toBeInTheDocument();
    });

    it("renders all 8 feature cards", () => {
        render(<FeaturesSection />);
        expect(
            screen.getByText("features.items.realTimeSearch.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.activityTracking.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.smartNoteTaking.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.hierarchicalFolders.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.aiSummarization.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.flashcardGeneration.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.autoTagging.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("features.items.knowledgeQa.title"),
        ).toBeInTheDocument();
    });

    it("renders token cost badges on AI features", () => {
        render(<FeaturesSection />);
        expect(screen.getAllByText("features.tokenCost")).toHaveLength(4);
    });

    it("has the features section anchor id", () => {
        const { container } = render(<FeaturesSection />);
        expect(container.querySelector("#features")).toBeInTheDocument();
    });
});
