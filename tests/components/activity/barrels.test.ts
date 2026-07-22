import * as activity from "@/components/activity";
import * as settings from "@/components/settings";

describe("barrel exports", () => {
    it("exports activity components", () => {
        expect(activity.ActivityStatsCards).toBeDefined();
        expect(activity.ActivityFilterBar).toBeDefined();
        expect(activity.ActivityTimeline).toBeDefined();
        expect(activity.ActivityTimelineItem).toBeDefined();
    });

    it("exports settings components and schema", () => {
        expect(settings.ProfileSettingsCard).toBeDefined();
        expect(settings.profileSchema).toBeDefined();
    });
});
