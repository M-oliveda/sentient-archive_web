import { countWords, generateExcerpt } from "@/lib/notes-utils";

describe("countWords", () => {
    it("returns 0 for empty string", () => {
        expect(countWords("")).toBe(0);
    });

    it("returns 0 for whitespace-only string", () => {
        expect(countWords("   ")).toBe(0);
    });

    it("counts simple words", () => {
        expect(countWords("hello world foo")).toBe(3);
    });

    it("strips fenced code blocks before counting", () => {
        expect(countWords("hello\n```\nconst x = 1;\n```\nworld")).toBe(2);
    });

    it("strips inline code before counting", () => {
        expect(countWords("use `useState` hook")).toBe(2);
    });

    it("counts a single word", () => {
        expect(countWords("hello")).toBe(1);
    });
});

describe("generateExcerpt", () => {
    it("strips heading markers", () => {
        expect(generateExcerpt("# Title")).toBe("Title");
        expect(generateExcerpt("## H2")).toBe("H2");
        expect(generateExcerpt("###### H6")).toBe("H6");
    });

    it("strips bold markers", () => {
        expect(generateExcerpt("**bold text**")).toBe("bold text");
    });

    it("strips italic markers", () => {
        expect(generateExcerpt("*italic text*")).toBe("italic text");
    });

    it("strips fenced code blocks", () => {
        expect(generateExcerpt("```\nconst x = 1;\n```\nAfter")).toBe("After");
    });

    it("strips inline code", () => {
        expect(generateExcerpt("`code` here")).toBe("code here");
    });

    it("strips markdown links", () => {
        expect(generateExcerpt("[click here](https://example.com)")).toBe("click here");
    });

    it("strips image syntax", () => {
        expect(generateExcerpt("![alt text](image.png) text")).toBe("text");
    });

    it("strips unordered list markers", () => {
        expect(generateExcerpt("- Item\n* Other\n+ Third")).toBe("Item Other Third");
    });

    it("strips ordered list markers", () => {
        expect(generateExcerpt("1. First\n2. Second")).toBe("First Second");
    });

    it("strips blockquote markers", () => {
        expect(generateExcerpt("> quoted text")).toBe("quoted text");
    });

    it("strips horizontal rules", () => {
        expect(generateExcerpt("above\n---\nbelow")).toBe("above below");
    });

    it("collapses newlines into spaces", () => {
        const result = generateExcerpt("line one\n\nline two");
        expect(result).toBe("line one line two");
    });

    it("trims leading and trailing whitespace", () => {
        expect(generateExcerpt("  hello  ")).toBe("hello");
    });

    it("truncates at the specified maxLength", () => {
        const content = "a".repeat(300);
        expect(generateExcerpt(content, 100)).toHaveLength(100);
    });

    it("uses 200 as the default maxLength", () => {
        const content = "a".repeat(300);
        expect(generateExcerpt(content)).toHaveLength(200);
    });

    it("returns the full string when shorter than maxLength", () => {
        expect(generateExcerpt("Short")).toBe("Short");
    });

    it("returns an empty string for empty input", () => {
        expect(generateExcerpt("")).toBe("");
    });
});
