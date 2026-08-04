import { render, screen } from "@testing-library/react";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import type { IActivityEntry } from "@/types/activity";

const entries: IActivityEntry[] = [
    {
        id: "1",
        category: "ai",
        title: "AI Summary",
        description: "Summarized note",
        createdAt: new Date().toISOString(),
        iconHint: "bot",
    },
    {
        id: "2",
        category: "notes",
        title: "Note created",
        description: "Older note",
        createdAt: "2024-01-01T12:00:00.000Z",
        iconHint: "file-text",
    },
];

describe("ActivityTimeline", () => {
    it("shows loading state", () => {
        render(<ActivityTimeline entries={[]} isLoading />);
        expect(screen.getByTestId("activity-timeline-loading")).toBeInTheDocument();
    });

    it("shows error state", () => {
        render(<ActivityTimeline entries={[]} isError />);
        expect(screen.getByTestId("activity-timeline-error")).toBeInTheDocument();
        expect(screen.getByText("timeline.error")).toBeInTheDocument();
    });

    it("shows empty state", () => {
        render(<ActivityTimeline entries={[]} />);
        expect(screen.getByTestId("activity-timeline-empty")).toBeInTheDocument();
        expect(screen.getByText("timeline.empty")).toBeInTheDocument();
    });

    it("groups entries by date", () => {
        render(<ActivityTimeline entries={entries} />);
        expect(screen.getByTestId("activity-timeline")).toBeInTheDocument();
        expect(screen.getByText("AI Summary")).toBeInTheDocument();
        expect(screen.getByText("Note created")).toBeInTheDocument();
        expect(screen.getByText("timeline.today")).toBeInTheDocument();
    });

    it("groups multiple entries on the same day", () => {
        const sameDay = new Date().toISOString();
        render(
            <ActivityTimeline
                entries={[
                    {
                        id: "a",
                        category: "ai",
                        title: "First",
                        description: "A",
                        createdAt: sameDay,
                        iconHint: "bot",
                    },
                    {
                        id: "b",
                        category: "tokens",
                        title: "Second",
                        description: "B",
                        createdAt: sameDay,
                        iconHint: "coins",
                    },
                ]}
            />,
        );
        expect(screen.getByText("First")).toBeInTheDocument();
        expect(screen.getByText("Second")).toBeInTheDocument();
        expect(screen.getAllByTestId("activity-timeline-item")).toHaveLength(2);
    });
});
