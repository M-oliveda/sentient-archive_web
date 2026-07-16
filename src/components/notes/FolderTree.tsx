import { useState } from "react";
import { FolderOpen, Folder as FolderIcon, FilePlus2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/useFolders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IFolderTreeProps {
    activeFolderId: string | null;
    onFolderSelect: (folderId: string | null) => void;
}

export function FolderTree({ activeFolderId, onFolderSelect }: IFolderTreeProps) {
    const { data: folders = [], isLoading } = useFolders();
    const createFolder = useCreateFolder();
    const deleteFolder = useDeleteFolder();

    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");

    const handleCreate = async () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        await createFolder.mutateAsync(trimmed);
        setNewName("");
        setIsCreating(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") {
            setIsCreating(false);
            setNewName("");
        }
    };

    return (
        <div className="space-y-0.5">
            <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Folders
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => setIsCreating(true)}
                    aria-label="New folder"
                >
                    <FilePlus2 className="size-3.5" />
                </Button>
            </div>

            <FolderItem
                label="All Notes"
                isActive={activeFolderId === null}
                onClick={() => onFolderSelect(null)}
                icon="all"
            />

            {!isLoading &&
                folders.map((folder) => (
                    <FolderItem
                        key={folder.id}
                        label={folder.name}
                        isActive={activeFolderId === folder.id}
                        onClick={() => onFolderSelect(folder.id)}
                        onDelete={() => deleteFolder.mutate(folder.id)}
                    />
                ))}

            {isCreating && (
                <div className="flex items-center gap-1 px-1 py-0.5">
                    <FolderIcon className="text-muted-foreground size-3.5 shrink-0" />
                    <Input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleCreate}
                        placeholder="Folder name"
                        className="h-6 text-xs"
                    />
                </div>
            )}
        </div>
    );
}

interface IFolderItemProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    onDelete?: () => void;
    icon?: "all";
}

function FolderItem({ label, isActive, onClick, onDelete, icon }: IFolderItemProps) {
    const [hovered, setHovered] = useState(false);
    const Icon = icon === "all" ? FolderOpen : FolderIcon;

    return (
        <div
            className={cn(
                "group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                className="flex flex-1 items-center gap-1.5 overflow-hidden"
                onClick={onClick}
            >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate text-xs font-medium">{label}</span>
            </button>

            {onDelete && hovered && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-muted-foreground hover:text-destructive shrink-0 rounded p-0.5 transition-colors"
                    aria-label={`Delete ${label} folder`}
                >
                    <X className="size-3" />
                </button>
            )}
        </div>
    );
}
