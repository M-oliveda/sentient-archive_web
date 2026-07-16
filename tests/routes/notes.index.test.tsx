import React from "react";
import { screen } from "@testing-library/react";
import { Route } from "@/routes/notes.index";
import { renderRouteComponent } from "./route-test-utils";

jest.mock("@tanstack/react-router", () => ({
    createFileRoute: () => (options: { component: React.ComponentType }) => ({
        options,
    }),
}));

jest.mock("@/pages/dashboard/NotesPage", () => ({
    NotesPage: () => <div data-testid="notes-page">Notes</div>,
}));

describe("notes index route", () => {
    it("renders NotesPage", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByTestId("notes-page")).toBeInTheDocument();
    });

    it("renders NotesPage content", () => {
        renderRouteComponent(Route.options.component);
        expect(screen.getByText("Notes")).toBeInTheDocument();
    });
});
