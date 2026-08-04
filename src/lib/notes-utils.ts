export function countWords(content: string): number {
    const stripped = content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]+`/g, "");
    return stripped.trim() ? stripped.trim().split(/\s+/).length : 0;
}

export function generateExcerpt(content: string, maxLength = 200): string {
    const stripped = content
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`{3}[\s\S]*?`{3}/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[.*?\]\(.+?\)/g, "")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/^[-*+]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/^>\s+/gm, "")
        .replace(/^[-_*]{3,}$/gm, "")
        .replace(/\n+/g, " ")
        .trim();
    return stripped.slice(0, maxLength);
}
