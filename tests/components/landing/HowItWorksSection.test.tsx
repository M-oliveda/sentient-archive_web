import { render, screen, act } from "@testing-library/react";
import * as framerMotion from "framer-motion";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";

jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));

describe("HowItWorksSection", () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it("renders the section heading", () => {
        render(<HowItWorksSection />);
        expect(screen.getByText("How It Works")).toBeInTheDocument();
    });

    it("renders all three steps", () => {
        render(<HowItWorksSection />);
        expect(screen.getByText("Create Your Account")).toBeInTheDocument();
        expect(screen.getByText("Capture Your Knowledge")).toBeInTheDocument();
        expect(screen.getByText("Unlock AI Insights")).toBeInTheDocument();
    });

    it("renders step numbers", () => {
        render(<HowItWorksSection />);
        expect(screen.getByText("Step 1")).toBeInTheDocument();
        expect(screen.getByText("Step 2")).toBeInTheDocument();
        expect(screen.getByText("Step 3")).toBeInTheDocument();
    });

    it("renders Start For Free CTA linking to /signup", () => {
        render(<HowItWorksSection />);
        const link = screen.getByRole("link", { name: "Start For Free" });
        expect(link).toHaveAttribute("href", "/signup");
    });

    it("has the how-it-works anchor id", () => {
        const { container } = render(<HowItWorksSection />);
        expect(container.querySelector("#how-it-works")).toBeInTheDocument();
    });

    it("skips the timer cycle when not in view", () => {
        jest.spyOn(framerMotion, "useInView").mockReturnValue(false);
        jest.useFakeTimers();
        render(<HowItWorksSection />);
        act(() => {
            jest.advanceTimersByTime(5000);
        });
    });

    it("cycles through all steps and stops", () => {
        jest.useFakeTimers();
        render(<HowItWorksSection />);
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        act(() => {
            jest.advanceTimersByTime(1500);
        });
    });
});
