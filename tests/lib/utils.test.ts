import { cn, formatTimeAgo, formatTokenAmount } from "@/lib/utils";

// Mock i18n
jest.mock("@/lib/i18n", () => ({
    __esModule: true,
    default: {
        t: (key: string, options?: { ns?: string; count?: number; amount?: number | string }) => {
            if (key === "timeAgo.seconds") return `${options?.count}s ago`;
            if (key === "timeAgo.minutes") return `${options?.count}m ago`;
            if (key === "timeAgo.hours") return `${options?.count}h ago`;
            if (key === "timeAgo.days") return `${options?.count}d ago`;
            if (key === "tokens.unit") return `${options?.amount} TKN`;
            if (key === "tokens.unitCompact") return `${options?.amount}k TKN`;
            return key;
        },
    },
}));

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

describe("formatTokenAmount", () => {
    it("returns the raw amount for values under 1000", () => {
        expect(formatTokenAmount(0)).toBe("0 TKN");
        expect(formatTokenAmount(250)).toBe("250 TKN");
    });

    it("returns a compact 'k' format for whole thousands", () => {
        expect(formatTokenAmount(50000)).toBe("50k TKN");
        expect(formatTokenAmount(1000)).toBe("1k TKN");
    });

    it("returns a compact 'k' format with one decimal for partial thousands", () => {
        expect(formatTokenAmount(1500)).toBe("1.5k TKN");
    });
});
