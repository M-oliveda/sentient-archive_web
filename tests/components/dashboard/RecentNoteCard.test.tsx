import { render, screen } from "@testing-library/react";
import { RecentNoteCard } from "@/components/dashboard/RecentNoteCard";

const defaultProps = {
    folder: "Projects",
    title: "Meeting Minutes",
    excerpt: "Q3 planning discussion.",
    tags: ["planning", "team"],
    timeAgo: "2h ago",
};

describe("RecentNoteCard", () => {
    it("renders the folder name", () => {
        render(<RecentNoteCard {...defaultProps} />);
        expect(screen.getByText("Projects")).toBeInTheDocument();
    });

    it("renders the title", () => {
        render(<RecentNoteCard {...defaultProps} />);
        expect(screen.getByText("Meeting Minutes")).toBeInTheDocument();
    });

    it("renders the excerpt", () => {
        render(<RecentNoteCard {...defaultProps} />);
        expect(screen.getByText("Q3 planning discussion.")).toBeInTheDocument();
    });

    it("renders all tags with # prefix", () => {
        render(<RecentNoteCard {...defaultProps} />);
        expect(screen.getByText("#planning")).toBeInTheDocument();
        expect(screen.getByText("#team")).toBeInTheDocument();
    });

    it("renders the timeAgo string", () => {
        render(<RecentNoteCard {...defaultProps} />);
        expect(screen.getByText("2h ago")).toBeInTheDocument();
    });

    it("renders with empty tags array", () => {
        render(<RecentNoteCard {...defaultProps} tags={[]} />);
        expect(screen.queryByText(/#/)).not.toBeInTheDocument();
    });
});
