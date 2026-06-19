import { createElement, type ComponentType } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";

export function renderRouteComponent(
    component: unknown,
    options?: RenderOptions,
): RenderResult {
    return render(createElement(component as ComponentType), options);
}
