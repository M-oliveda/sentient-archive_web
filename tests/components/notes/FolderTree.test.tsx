import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FolderTree } from "@/components/notes/FolderTree";
import { useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/useFolders";

jest.mock("@/hooks/useFolders");

const FOLDER = {
    id: "f1",
    name: "Work",
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockMutate = jest.fn();
const mockMutateAsync = jest.fn().mockResolvedValue("new-id");

describe("FolderTree", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useFolders as jest.Mock).mockReturnValue({
            data: [FOLDER],
            isLoading: false,
        });
        (useCreateFolder as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
        });
        (useDeleteFolder as jest.Mock).mockReturnValue({
            mutate: mockMutate,
        });
    });

    it("renders 'All Notes' root item", () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        expect(screen.getByText("All Notes")).toBeInTheDocument();
    });

    it("renders folders from useFolders", () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        expect(screen.getByText("Work")).toBeInTheDocument();
    });

    it("calls onFolderSelect with null when All Notes is clicked", () => {
        const onFolderSelect = jest.fn();
        render(<FolderTree activeFolderId={null} onFolderSelect={onFolderSelect} />);
        fireEvent.click(screen.getByText("All Notes"));
        expect(onFolderSelect).toHaveBeenCalledWith(null);
    });

    it("calls onFolderSelect with the folder id when a folder is clicked", () => {
        const onFolderSelect = jest.fn();
        render(<FolderTree activeFolderId={null} onFolderSelect={onFolderSelect} />);
        fireEvent.click(screen.getByText("Work"));
        expect(onFolderSelect).toHaveBeenCalledWith("f1");
    });

    it("shows the new-folder input when the add button is clicked", () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("New folder"));
        expect(screen.getByPlaceholderText("Folder name")).toBeInTheDocument();
    });

    it("creates a folder when Enter is pressed in the input", async () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("New folder"));
        const input = screen.getByPlaceholderText("Folder name");
        fireEvent.change(input, { target: { value: "Personal" } });
        fireEvent.keyDown(input, { key: "Enter" });
        await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith("Personal"));
    });

    it("cancels folder creation when Escape is pressed", async () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("New folder"));
        const input = screen.getByPlaceholderText("Folder name");
        fireEvent.change(input, { target: { value: "Draft" } });
        fireEvent.keyDown(input, { key: "Escape" });
        await waitFor(() =>
            expect(
                screen.queryByPlaceholderText("Folder name"),
            ).not.toBeInTheDocument(),
        );
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("does not create a folder when input is blank on blur", async () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        fireEvent.click(screen.getByLabelText("New folder"));
        const input = screen.getByPlaceholderText("Folder name");
        fireEvent.blur(input);
        await waitFor(() => expect(mockMutateAsync).not.toHaveBeenCalled());
    });

    it("shows the delete button on hover and calls deleteFolder", async () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        const folderRow = screen.getByText("Work").closest("div.group");
        fireEvent.mouseEnter(folderRow!);
        const deleteBtn = await screen.findByLabelText("Delete Work folder");
        fireEvent.click(deleteBtn);
        expect(mockMutate).toHaveBeenCalledWith("f1");
    });

    it("hides the delete button on mouse leave", async () => {
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        const folderRow = screen.getByText("Work").closest("div.group")!;
        fireEvent.mouseEnter(folderRow);
        await screen.findByLabelText("Delete Work folder");
        fireEvent.mouseLeave(folderRow);
        await waitFor(() =>
            expect(
                screen.queryByLabelText("Delete Work folder"),
            ).not.toBeInTheDocument(),
        );
    });

    it("renders without folders when isLoading is true", () => {
        (useFolders as jest.Mock).mockReturnValue({ data: [], isLoading: true });
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        expect(screen.queryByText("Work")).not.toBeInTheDocument();
    });

    it("renders without folders when data is undefined (uses default [])", () => {
        (useFolders as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
        });
        render(<FolderTree activeFolderId={null} onFolderSelect={jest.fn()} />);
        expect(screen.queryByText("Work")).not.toBeInTheDocument();
        expect(screen.getByText("All Notes")).toBeInTheDocument();
    });
});
