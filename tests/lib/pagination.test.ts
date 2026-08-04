import {
    DEFAULT_PAGE_SIZE,
    buildPageItems,
    resolvePageOffset,
} from "@/lib/pagination";

describe("pagination utilities", () => {
    describe("DEFAULT_PAGE_SIZE", () => {
        it("exports the default page size constant", () => {
            expect(DEFAULT_PAGE_SIZE).toBe(20);
        });
    });

    describe("buildPageItems", () => {
        it("returns all pages when total pages <= 7", () => {
            expect(buildPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(buildPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });

        it("shows leading window when current page <= 3", () => {
            expect(buildPageItems(1, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
            expect(buildPageItems(2, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
            expect(buildPageItems(3, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
        });

        it("shows trailing window when current page >= totalPages - 2", () => {
            expect(buildPageItems(8, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
            expect(buildPageItems(9, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
            expect(buildPageItems(10, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
        });

        it("shows middle window with two ellipses for mid-range pages", () => {
            expect(buildPageItems(5, 10)).toEqual([
                1,
                "ellipsis",
                4,
                5,
                6,
                "ellipsis",
                10,
            ]);
            expect(buildPageItems(6, 12)).toEqual([
                1,
                "ellipsis",
                5,
                6,
                7,
                "ellipsis",
                12,
            ]);
        });
    });

    describe("resolvePageOffset", () => {
        it("clamps page below 1 to the first page", () => {
            expect(resolvePageOffset(0, 100, 20, 40)).toBe(0);
            expect(resolvePageOffset(-5, 100, 20, 0)).toBeNull();
        });

        it("clamps page above the last page", () => {
            expect(resolvePageOffset(99, 100, 20, 0)).toBe(80);
            expect(resolvePageOffset(99, 100, 20, 80)).toBeNull();
        });

        it("returns null when the offset is unchanged", () => {
            expect(resolvePageOffset(2, 100, 20, 20)).toBeNull();
            expect(resolvePageOffset(1, 0, 20, 0)).toBeNull();
        });

        it("calculates correct offset for valid page changes", () => {
            expect(resolvePageOffset(1, 100, 20, 20)).toBe(0);
            expect(resolvePageOffset(3, 100, 20, 0)).toBe(40);
            expect(resolvePageOffset(5, 100, 20, 60)).toBe(80);
        });

        it("handles edge case with total 0", () => {
            expect(resolvePageOffset(1, 0, 20, 0)).toBeNull();
            expect(resolvePageOffset(2, 0, 20, 0)).toBeNull();
        });
    });
});
