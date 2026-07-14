import { render, screen } from "@testing-library/react";
import { ActivityItem } from "@/components/dashboard/ActivityItem";

describe("ActivityItem", () => {
    it("renders name, action, and timeAgo", () => {
        render(
            <ActivityItem
                name="Sarah K."
                action="minted 500 tokens."
                timeAgo="2 mins ago"
            />,
        );
        expect(screen.getByText("Sarah K.")).toBeInTheDocument();
        expect(screen.getByText("minted 500 tokens.")).toBeInTheDocument();
        expect(screen.getByText("2 mins ago")).toBeInTheDocument();
    });

    it("renders avatar image when avatarUrl is provided", () => {
        render(
            <ActivityItem
                name="Sarah K."
                action="did something."
                timeAgo="1m ago"
                avatarUrl="https://example.com/sarah.jpg"
            />,
        );
        expect(screen.getByRole("img", { name: "Sarah K." })).toHaveAttribute(
            "src",
            "https://example.com/sarah.jpg",
        );
    });

    it("renders two-letter initials when no avatarUrl", () => {
        render(
            <ActivityItem name="Sarah K." action="did something." timeAgo="1m ago" />,
        );
        expect(screen.getByText("SK")).toBeInTheDocument();
    });

    it("renders single initial for single-word name", () => {
        render(<ActivityItem name="Sarah" action="did something." timeAgo="1m ago" />);
        expect(screen.getByText("S")).toBeInTheDocument();
    });
});
