import {
    SentientArchiveLogo,
    SentientInput,
    SentientInputPassword,
    defaultPasswordRules,
} from "@/components/branding";

describe("branding barrel exports", () => {
    it("should export branding components and password rules", () => {
        expect(SentientArchiveLogo).toBeDefined();
        expect(SentientInput).toBeDefined();
        expect(SentientInputPassword).toBeDefined();
        expect(defaultPasswordRules.length).toBeGreaterThan(0);
    });
});
