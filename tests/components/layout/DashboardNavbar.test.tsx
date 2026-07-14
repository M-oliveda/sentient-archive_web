import { render, screen } from "@testing-library/react";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useAuthStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@tanstack/react-router", () => ({
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
    ),
}));
jest.mock("@/components/ui/avatar", () => ({
    Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AvatarImage: ({ src, alt }: { src?: string; alt?: string }) =>
        src ? <img src={src} alt={alt} /> : null,
    AvatarFallback: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
}));

describe("DashboardNavbar", () => {
    it("renders the brand name", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<DashboardNavbar />);
        expect(screen.getByText("SentientArchive")).toBeInTheDocument();
    });

    it("shows photo when user has photoURL", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: "Alex Smith",
                email: "alex@test.com",
                photoURL: "https://example.com/avatar.jpg",
            },
        });
        render(<DashboardNavbar />);
        const img = screen.getByRole("img", { name: "Alex Smith" });
        expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("shows two-letter initials from display name", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: "Alex Smith",
                email: "alex@test.com",
                photoURL: null,
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByText("AS")).toBeInTheDocument();
    });

    it("shows single initial when display name has one word", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: "Alex",
                email: "alex@test.com",
                photoURL: null,
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("falls back to email initial when displayName is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: null,
                email: "alex@test.com",
                photoURL: null,
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("shows ? when no user", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        render(<DashboardNavbar />);
        expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("falls back to ? when displayName is null and email is empty", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: null,
                email: "",
                photoURL: null,
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("falls back to email when displayName is whitespace only", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: "   ",
                email: "alex@test.com",
                photoURL: null,
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("uses User as alt text when photoURL exists but displayName is null", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                displayName: null,
                email: "alex@test.com",
                photoURL: "https://example.com/avatar.jpg",
            },
        });
        render(<DashboardNavbar />);
        expect(screen.getByRole("img", { name: "User" })).toBeInTheDocument();
    });
});
