import { cn, formatTimeAgo } from "@/lib/utils";

describe("cn", () => {
    it("merges class names correctly", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        const isHidden = false;
        const isVisible = true;
        expect(cn("base", isHidden && "hidden", isVisible && "visible")).toBe(
            "base visible",
        );
    });

    it("merges tailwind classes and resolves conflicts", () => {
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("handles arrays of classes", () => {
        expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    });

    it("handles undefined and null values", () => {
        expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("returns empty string for no inputs", () => {
        expect(cn()).toBe("");
    });
});

describe("formatTimeAgo", () => {
    it("returns seconds format for less than 60 seconds ago", () => {
        const date = new Date(Date.now() - 30 * 1000);
        expect(formatTimeAgo(date)).toBe("30s ago");
    });

    it("returns minutes format for less than 60 minutes ago", () => {
        const date = new Date(Date.now() - 5 * 60 * 1000);
        expect(formatTimeAgo(date)).toBe("5m ago");
    });

    it("returns hours format for less than 24 hours ago", () => {
        const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
        expect(formatTimeAgo(date)).toBe("3h ago");
    });

    it("returns days format for 24 or more hours ago", () => {
        const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(date)).toBe("2d ago");
    });
});
