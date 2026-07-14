import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "@/components/landing/FeaturesSection";

describe("FeaturesSection", () => {
    it("renders the section heading", () => {
        render(<FeaturesSection />);
        expect(
            screen.getByText(/Everything You Need to Build Your Knowledge Empire/),
        ).toBeInTheDocument();
    });

    it("renders all 8 feature cards", () => {
        render(<FeaturesSection />);
        expect(screen.getByText("Real-Time Search")).toBeInTheDocument();
        expect(screen.getByText("Activity Tracking")).toBeInTheDocument();
        expect(screen.getByText("Smart Note-Taking")).toBeInTheDocument();
        expect(screen.getByText("Hierarchical Folders")).toBeInTheDocument();
        expect(screen.getByText("AI Summarization")).toBeInTheDocument();
        expect(screen.getByText("Flashcard Generation")).toBeInTheDocument();
        expect(screen.getByText("Auto-Tagging")).toBeInTheDocument();
        expect(screen.getByText("Knowledge Q&A")).toBeInTheDocument();
    });

    it("renders token cost badges on AI features", () => {
        render(<FeaturesSection />);
        expect(screen.getAllByText("2 tokens")).toHaveLength(2);
        expect(screen.getByText("3 tokens")).toBeInTheDocument();
        expect(screen.getByText("4 tokens")).toBeInTheDocument();
    });

    it("has the features section anchor id", () => {
        const { container } = render(<FeaturesSection />);
        expect(container.querySelector("#features")).toBeInTheDocument();
    });
});
