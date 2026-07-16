import { createFileRoute } from "@tanstack/react-router";
import { NoteDetailPage } from "@/pages/dashboard/NoteDetailPage";

export const Route = createFileRoute("/notes/$noteId")({
    component: NoteDetailPageRoute,
});

function NoteDetailPageRoute() {
    const { noteId } = Route.useParams();
    return <NoteDetailPage noteId={noteId} />;
}
