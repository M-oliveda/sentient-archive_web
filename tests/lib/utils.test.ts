import { cn } from "@/lib/utils";

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
