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
        expect(screen.getByText("howItWorks.title")).toBeInTheDocument();
    });

    it("renders all three steps", () => {
        render(<HowItWorksSection />);
        expect(
            screen.getByText("howItWorks.steps.createAccount.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("howItWorks.steps.captureKnowledge.title"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("howItWorks.steps.unlockInsights.title"),
        ).toBeInTheDocument();
    });

    it("renders step numbers", () => {
        render(<HowItWorksSection />);
        expect(screen.getAllByText("howItWorks.stepLabel")).toHaveLength(3);
    });

    it("renders Start For Free CTA linking to /signup", () => {
        render(<HowItWorksSection />);
        const link = screen.getByRole("link", { name: "howItWorks.cta" });
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
