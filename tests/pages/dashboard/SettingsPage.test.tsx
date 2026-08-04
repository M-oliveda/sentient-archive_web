import { render, screen } from "@testing-library/react";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";

jest.mock("@/stores/authStore", () => ({
    useAuthStore: jest.fn(),
}));

jest.mock("@/components/settings/ProfileSettingsCard", () => ({
    ProfileSettingsCard: () => (
        <div data-testid="profile-settings-card">Profile Card</div>
    ),
}));

import { useAuthStore } from "@/stores/authStore";

describe("SettingsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders nothing when user is missing", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });
        const { container } = render(<SettingsPage />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders settings header and profile card", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: {
                uid: "u1",
                email: "jane@example.com",
                displayName: "Jane",
                photoURL: null,
                role: "client",
                isActive: true,
                tokenBalance: 10,
            },
        });

        render(<SettingsPage />);
        expect(screen.getByText("page.title")).toBeInTheDocument();
        expect(screen.getByText("page.eyebrow")).toBeInTheDocument();
        expect(screen.getByText("page.subtitle")).toBeInTheDocument();
        expect(screen.getByTestId("profile-settings-card")).toBeInTheDocument();
    });
});
