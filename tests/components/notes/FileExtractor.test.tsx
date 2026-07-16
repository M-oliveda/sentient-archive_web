import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { FileExtractor } from "@/components/notes/FileExtractor";
import { toast } from "sonner";
import { useExtractFile } from "@/hooks/useExtractFile";

const mockMutateAsync = jest.fn();

jest.mock("@/hooks/useExtractFile", () => ({
    useExtractFile: jest.fn(() => ({
        mutateAsync: mockMutateAsync,
        isPending: false,
    })),
}));

jest.mock("sonner", () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

function makeFile(name: string, type: string, sizeBytes = 100): File {
    const blob = new Blob([new ArrayBuffer(sizeBytes)], { type });
    return new File([blob], name, { type });
}

describe("FileExtractor", () => {
    const onNoteCreated = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the Upload Document button", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        expect(screen.getByText("Upload Document")).toBeInTheDocument();
    });

    it("clicking the button triggers the hidden file input", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        const clickSpy = jest.spyOn(input, "click").mockImplementation(() => {});
        fireEvent.click(screen.getByText("Upload Document"));
        expect(clickSpy).toHaveBeenCalledTimes(1);
        clickSpy.mockRestore();
    });

    it("shows the first loading stage when isPending", () => {
        (useExtractFile as jest.Mock).mockReturnValueOnce({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        expect(screen.getByText("Uploading…")).toBeInTheDocument();
    });

    it("advances to the next stage after the interval elapses", () => {
        jest.useFakeTimers();
        (useExtractFile as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        expect(screen.getByText("Uploading…")).toBeInTheDocument();
        act(() => {
            jest.advanceTimersByTime(1200);
        });
        expect(screen.getByText("Parsing content…")).toBeInTheDocument();
        jest.useRealTimers();
    });

    it("does nothing when no file is selected", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        fireEvent.change(input, { target: { files: [] } });
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("shows a toast error for unsupported file type", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        const file = makeFile("report.docx", "application/msword");
        fireEvent.change(input, { target: { files: [file] } });
        expect(toast.error).toHaveBeenCalledWith(
            "Only PDF, TXT, and MD files are supported.",
        );
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("accepts .md files by extension even with non-standard MIME", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        const file = makeFile("notes.md", "application/octet-stream");

        mockMutateAsync.mockResolvedValue({
            data: { title: "Notes", noteId: "n1" },
        });

        fireEvent.change(input, { target: { files: [file] } });
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("shows a toast error when file exceeds 10 MB", () => {
        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        const oversizedFile = makeFile("big.pdf", "application/pdf", 11 * 1024 * 1024);
        fireEvent.change(input, { target: { files: [oversizedFile] } });
        expect(toast.error).toHaveBeenCalledWith("File must be smaller than 10 MB.");
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("calls mutateAsync and shows success toast for a valid PDF", async () => {
        const file = makeFile("doc.pdf", "application/pdf");
        mockMutateAsync.mockResolvedValue({
            data: { title: "Doc Title", noteId: "note-42" },
        });

        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(file));
        expect(toast.success).toHaveBeenCalledWith('"Doc Title" created from doc.pdf');
        expect(onNoteCreated).toHaveBeenCalledWith("note-42");
    });

    it("calls mutateAsync for a plain text file", async () => {
        const file = makeFile("notes.txt", "text/plain");
        mockMutateAsync.mockResolvedValue({
            data: { title: "Notes", noteId: "note-txt" },
        });

        render(<FileExtractor onNoteCreated={onNoteCreated} />);
        const input = document.querySelector("input[type=file]") as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(file));
    });
});
