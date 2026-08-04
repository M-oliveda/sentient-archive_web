import { render, screen } from "@testing-library/react";
import { WhySentientArchiveSection } from "@/components/landing/WhySentientArchiveSection";

describe("WhySentientArchiveSection", () => {
    it("renders the section heading", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("why.title")).toBeInTheDocument();
    });

    it("renders Cognitive Search feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("why.items.cognitiveSearch.title")).toBeInTheDocument();
    });

    it("renders Auto-Linking feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("why.items.autoLinking.title")).toBeInTheDocument();
    });

    it("renders Private by Design feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("why.items.privateByDesign.title")).toBeInTheDocument();
    });
});
