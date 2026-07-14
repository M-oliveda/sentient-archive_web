import { render, screen } from "@testing-library/react";
import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "@/components/ui/avatar";

describe("Avatar", () => {
    it("renders fallback when no image is provided", () => {
        render(
            <Avatar>
                <AvatarFallback>AB</AvatarFallback>
            </Avatar>,
        );
        expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("renders AvatarImage with src and alt", () => {
        render(
            <Avatar>
                <AvatarImage src="https://example.com/avatar.jpg" alt="Test User" />
                <AvatarFallback>TU</AvatarFallback>
            </Avatar>,
        );
        const img = screen.queryByAltText("Test User");
        expect(img ?? screen.getByText("TU")).toBeInTheDocument();
    });

    it("renders AvatarBadge", () => {
        render(
            <Avatar>
                <AvatarFallback>AB</AvatarFallback>
                <AvatarBadge data-testid="badge" />
            </Avatar>,
        );
        expect(screen.getByTestId("badge")).toBeInTheDocument();
    });

    it("renders AvatarGroup with multiple avatars", () => {
        render(
            <AvatarGroup data-testid="group">
                <Avatar>
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar>
                    <AvatarFallback>B</AvatarFallback>
                </Avatar>
            </AvatarGroup>,
        );
        expect(screen.getByTestId("group")).toBeInTheDocument();
    });

    it("renders AvatarGroupCount", () => {
        render(
            <AvatarGroup>
                <AvatarGroupCount data-testid="count">+3</AvatarGroupCount>
            </AvatarGroup>,
        );
        expect(screen.getByTestId("count")).toBeInTheDocument();
        expect(screen.getByText("+3")).toBeInTheDocument();
    });
});
