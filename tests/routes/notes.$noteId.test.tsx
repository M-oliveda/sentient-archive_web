import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/notes.$noteId";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
        useParams: () => ({ noteId: "note-abc" }),
    }),
}));

jest.mock("@/pages/dashboard/NoteDetailPage", () => ({
    NoteDetailPage: ({ noteId }: { noteId: string }) => (
        <div data-testid="note-detail-page" data-note-id={noteId}>
            Note Detail
        </div>
    ),
}));

describe("notes.$noteId route", () => {
    it("renders the NoteDetailPage component", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("note-detail-page")).toBeInTheDocument();
    });

    it("passes the noteId from Route.useParams to NoteDetailPage", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("note-detail-page")).toHaveAttribute(
            "data-note-id",
            "note-abc",
        );
    });

    it("renders NoteDetailPage content", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByText("Note Detail")).toBeInTheDocument();
    });
});
