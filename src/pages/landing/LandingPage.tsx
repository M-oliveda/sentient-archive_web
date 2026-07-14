import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhySentientArchiveSection } from "@/components/landing/WhySentientArchiveSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TokenSystemSection } from "@/components/landing/TokenSystemSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
    return (
        <div className="bg-background min-h-screen">
            <PublicNavbar />
            <main className="py:48 container mx-auto lg:px-7 lg:py-20">
                <HeroSection />
                <WhySentientArchiveSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TokenSystemSection />
            </main>
            <LandingFooter />
        </div>
    );
}
