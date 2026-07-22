import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";

const mockMutateAsync = jest.fn();

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/hooks/useUpdateProfile", () => ({
    useUpdateProfile: jest.fn(),
}));

import { toast } from "sonner";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

describe("ProfileSettingsCard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMutateAsync.mockResolvedValue({
            success: true,
            data: { displayName: "Jane Doe" },
        });
        (useUpdateProfile as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });
    });

    it("renders avatar, fields, and save button", () => {
        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL={null}
            />,
        );

        expect(screen.getByTestId("profile-settings-card")).toBeInTheDocument();
        expect(screen.getByTestId("profile-display-name")).toHaveValue("John Doe");
        expect(screen.getByTestId("profile-username")).toHaveValue("@john");
        expect(screen.getByTestId("profile-save-button")).toBeDisabled();
    });

    it("validates empty display name", async () => {
        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL={null}
            />,
        );

        fireEvent.change(screen.getByTestId("profile-display-name"), {
            target: { value: "   " },
        });
        fireEvent.click(screen.getByTestId("profile-save-button"));

        await waitFor(() => {
            expect(
                screen.getByTestId("profile-display-name-error"),
            ).toBeInTheDocument();
        });
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("submits profile update and shows success toast", async () => {
        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL="https://example.com/a.png"
            />,
        );

        fireEvent.change(screen.getByTestId("profile-display-name"), {
            target: { value: "Jane Doe" },
        });
        fireEvent.click(screen.getByTestId("profile-save-button"));

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalledWith({
                displayName: "Jane Doe",
            });
        });
        expect(toast.success).toHaveBeenCalledWith("Profile updated");
    });

    it("shows error toast when mutation fails", async () => {
        mockMutateAsync.mockRejectedValue(new Error("Server error"));

        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL={null}
            />,
        );

        fireEvent.change(screen.getByTestId("profile-display-name"), {
            target: { value: "Jane Doe" },
        });
        fireEvent.click(screen.getByTestId("profile-save-button"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Server error");
        });
    });

    it("shows generic error toast for non-Error rejects", async () => {
        mockMutateAsync.mockRejectedValue("boom");

        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL={null}
            />,
        );

        fireEvent.change(screen.getByTestId("profile-display-name"), {
            target: { value: "Jane Doe" },
        });
        fireEvent.click(screen.getByTestId("profile-save-button"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Failed to update profile");
        });
    });

    it("uses email in avatar alt when displayName is null", () => {
        render(
            <ProfileSettingsCard
                displayName={null}
                email="jane@example.com"
                photoURL="https://example.com/a.png"
            />,
        );

        expect(screen.getByTestId("profile-display-name")).toHaveValue("");
    });

    it("falls back to email for username without @", () => {
        render(
            <ProfileSettingsCard
                displayName={null}
                email="localuser"
                photoURL={null}
            />,
        );

        expect(screen.getByTestId("profile-username")).toHaveValue("localuser");
    });

    it("shows saving label while mutation is pending", () => {
        (useUpdateProfile as jest.Mock).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
        });

        render(
            <ProfileSettingsCard
                displayName="John Doe"
                email="john@example.com"
                photoURL={null}
            />,
        );

        expect(screen.getByTestId("profile-save-button")).toHaveTextContent(
            "Saving...",
        );
        expect(screen.getByTestId("profile-save-button")).toBeDisabled();
    });
});
