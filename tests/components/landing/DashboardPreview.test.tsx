import { render, screen, fireEvent, act } from "@testing-library/react";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

describe("DashboardPreview", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("renders the preview container", () => {
        render(<DashboardPreview />);
        expect(screen.getByTestId("dashboard-preview")).toBeInTheDocument();
    });

    it("shows the dashboard screen initially", () => {
        render(<DashboardPreview />);
        expect(screen.getByTestId("screen-dashboard")).toBeInTheDocument();
    });

    it("renders 4 indicator dots", () => {
        render(<DashboardPreview />);
        expect(screen.getAllByTestId(/^screen-dot-/)).toHaveLength(4);
    });

    it("auto-advances to the notes screen after one cycle", () => {
        render(<DashboardPreview />);
        act(() => {
            jest.advanceTimersByTime(3400);
        });
        expect(screen.getByTestId("screen-notes")).toBeInTheDocument();
    });

    it("advances through all 4 screens and wraps back", () => {
        render(<DashboardPreview />);
        act(() => {
            jest.advanceTimersByTime(3400 * 4);
        });
        expect(screen.getByTestId("screen-dashboard")).toBeInTheDocument();
    });

    it("pauses auto-cycling on mouse enter", () => {
        render(<DashboardPreview />);
        const wrapper = screen.getByTestId("dashboard-preview");

        fireEvent.mouseEnter(wrapper);
        act(() => {
            jest.advanceTimersByTime(3400);
        });

        expect(screen.getByTestId("screen-dashboard")).toBeInTheDocument();
    });

    it("resumes cycling after mouse leave", () => {
        render(<DashboardPreview />);
        const wrapper = screen.getByTestId("dashboard-preview");

        fireEvent.mouseEnter(wrapper);
        fireEvent.mouseLeave(wrapper);
        act(() => {
            jest.advanceTimersByTime(3400);
        });

        expect(screen.getByTestId("screen-notes")).toBeInTheDocument();
    });

    it("clicking a dot changes the active screen", () => {
        render(<DashboardPreview />);
        fireEvent.click(screen.getByTestId("screen-dot-2"));
        expect(screen.getByTestId("screen-editor")).toBeInTheDocument();
    });

    it("clicking a dot resets the cycle timer", () => {
        render(<DashboardPreview />);

        act(() => {
            jest.advanceTimersByTime(1700);
        });

        fireEvent.click(screen.getByTestId("screen-dot-2"));

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.getByTestId("screen-editor")).toBeInTheDocument();
    });

    it("cycles correctly through all dot selections", () => {
        render(<DashboardPreview />);

        fireEvent.click(screen.getByTestId("screen-dot-3"));
        expect(screen.getByTestId("screen-ai")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("screen-dot-1"));
        expect(screen.getByTestId("screen-notes")).toBeInTheDocument();
    });

    it("clears the interval on unmount", () => {
        const spy = jest.spyOn(global, "clearInterval");
        const { unmount } = render(<DashboardPreview />);
        unmount();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it("clears the interval when paused", () => {
        const spy = jest.spyOn(global, "clearInterval");
        render(<DashboardPreview />);
        const wrapper = screen.getByTestId("dashboard-preview");

        fireEvent.mouseEnter(wrapper);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it("handles pause state with defensive cleanup", () => {
        const clearSpy = jest.spyOn(global, "clearInterval");
        const { unmount } = render(<DashboardPreview />);
        const wrapper = screen.getByTestId("dashboard-preview");

        // Pause and unmount to test cleanup path with paused state
        fireEvent.mouseEnter(wrapper);
        act(() => {
            jest.advanceTimersByTime(100);
        });
        unmount();
        expect(clearSpy).toHaveBeenCalled();
        clearSpy.mockRestore();
    });
});
