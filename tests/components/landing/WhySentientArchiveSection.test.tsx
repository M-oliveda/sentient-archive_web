import { render, screen } from "@testing-library/react";
import { WhySentientArchiveSection } from "@/components/landing/WhySentientArchiveSection";

describe("WhySentientArchiveSection", () => {
    it("renders the section heading", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("Why SentientArchive?")).toBeInTheDocument();
    });

    it("renders Cognitive Search feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("Cognitive Search")).toBeInTheDocument();
    });

    it("renders Auto-Linking feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("Auto-Linking")).toBeInTheDocument();
    });

    it("renders Private by Design feature", () => {
        render(<WhySentientArchiveSection />);
        expect(screen.getByText("Private by Design")).toBeInTheDocument();
    });
});
