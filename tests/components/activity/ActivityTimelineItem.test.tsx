import { render, screen } from "@testing-library/react";
import { ActivityTimelineItem } from "@/components/activity/ActivityTimelineItem";
import type { IActivityEntry } from "@/types/activity";

const entry: IActivityEntry = {
    id: "1",
    category: "notes",
    title: "Note created",
    description: "Research notes",
    createdAt: "2024-10-24T12:00:00.000Z",
    iconHint: "file-text",
};

describe("ActivityTimelineItem", () => {
    it("renders title and description", () => {
        render(<ActivityTimelineItem entry={entry} />);
        expect(screen.getByTestId("activity-timeline-item")).toBeInTheDocument();
        expect(screen.getByText("Note created")).toBeInTheDocument();
        expect(screen.getByText("Research notes")).toBeInTheDocument();
    });

    it("uses pencil icon when iconHint is missing", () => {
        const { container } = render(
            <ActivityTimelineItem entry={{ ...entry, iconHint: undefined }} />,
        );
        expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("falls back to pencil for unknown icon hints", () => {
        const { container } = render(
            <ActivityTimelineItem
                entry={{
                    ...entry,
                    iconHint: "unknown" as IActivityEntry["iconHint"],
                }}
            />,
        );
        expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("omits connector line when isLast", () => {
        const { container } = render(<ActivityTimelineItem entry={entry} isLast />);
        expect(container.querySelector(".absolute.top-10")).not.toBeInTheDocument();
    });
});
