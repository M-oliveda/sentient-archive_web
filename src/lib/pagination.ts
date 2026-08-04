export const DEFAULT_PAGE_SIZE = 20;

export function buildPageItems(
    currentPage: number,
    totalPages: number,
): Array<number | "ellipsis"> {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages,
    ];
}

export function resolvePageOffset(
    page: number,
    total: number,
    pageSize: number,
    currentOffset: number,
): number | null {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const nextPage = Math.min(Math.max(page, 1), pages);
    const nextOffset = (nextPage - 1) * pageSize;
    if (nextOffset === currentOffset) {
        return null;
    }
    return nextOffset;
}
