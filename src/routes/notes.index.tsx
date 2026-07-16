import { createFileRoute } from "@tanstack/react-router";
import { NotesPage } from "@/pages/dashboard/NotesPage";

export const Route = createFileRoute("/notes/")({
    component: NotesIndexRoute,
});

function NotesIndexRoute() {
    return <NotesPage />;
}
