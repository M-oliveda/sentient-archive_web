import { useRef, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useExtractFile } from "@/hooks/useExtractFile";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["application/pdf", "text/plain", "text/markdown"];
const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const STAGES = ["Uploading…", "Parsing content…", "Creating note…"];
const STAGE_INTERVAL_MS = 1200;

interface IFileExtractorProps {
    onNoteCreated: (noteId: string) => void;
    className?: string;
}

export function FileExtractor({ onNoteCreated, className }: IFileExtractorProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const extractFile = useExtractFile();
    const isPending = extractFile.isPending;
    const [stageIndex, setStageIndex] = useState(0);

    useEffect(() => {
        if (!isPending) {
            setStageIndex(0);
            return;
        }
        const id = setInterval(() => {
            setStageIndex((i) => (i + 1) % STAGES.length);
        }, STAGE_INTERVAL_MS);
        return () => clearInterval(id);
    }, [isPending]);

    const validate = (file: File): string | null => {
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
            return "Only PDF, TXT, and MD files are supported.";
        }
        if (file.size > MAX_SIZE_BYTES) {
            return "File must be smaller than 10 MB.";
        }
        return null;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validate(file);
        if (error) {
            toast.error(error);
            e.target.value = "";
            return;
        }

        const result = await extractFile.mutateAsync(file);
        toast.success(`"${result.data.title}" created from ${file.name}`);
        onNoteCreated(result.data.noteId);
        e.target.value = "";
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                disabled={isPending}
                className="hidden"
                aria-hidden="true"
            />
            <Button
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={isPending}
                className={cn(className)}
            >
                {isPending ? (
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={stageIndex}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <motion.span
                                className="inline-block size-4 rounded-full border-2 border-current border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                            {STAGES[stageIndex]}
                        </motion.span>
                    </AnimatePresence>
                ) : (
                    <>
                        <Upload className="size-4" />
                        Upload Document
                    </>
                )}
            </Button>
        </>
    );
}
