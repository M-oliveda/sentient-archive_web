import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, CheckCircle2, Mail, Scale } from "lucide-react";
import { PublicNavbar } from "@/components/layout";

export function TermsAndPrivacyPage() {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setShowScrollTop(window.scrollY > 300);
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PublicNavbar />
            <div className="bg-background min-h-screen p-4 py-8">
                <div className="mx-auto max-w-4xl">
                    <Card className="relative">
                        <CardHeader className="space-y-2 pb-6">
                            <p className="text-muted-foreground flex items-center gap-2">
                                <Scale className="size-4" />
                                <span className="text-sm">Legal Documentation</span>
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Terms of Service &amp; Privacy Policy
                            </h1>
                            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                <span>Version 1</span>
                                <span className="hidden sm:inline">•</span>
                                <span>Last Updated: 2026/06/22</span>
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-8 pb-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    1. Introduction
                                </h2>
                                <div className="text-muted-foreground space-y-3 text-base leading-relaxed">
                                    <p>
                                        Welcome to SentientArchive. These Terms of
                                        Service (&quot;Terms&quot;) govern your access
                                        to and use of the SentientArchive AI-Powered
                                        Knowledge OS (the &quot;Service&quot;). By
                                        accessing or using our Service, you agree to be
                                        bound by these Terms and our Privacy Policy.
                                    </p>
                                    <p>
                                        SentientArchive is designed to be your cognitive
                                        partner, organizing information through advanced
                                        neural processing. Our mission is to ensure that
                                        your personal knowledge remains secure, private,
                                        and eternally accessible.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    2. Data Collection
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    To provide the SentientArchive experience, we
                                    collect specific information regarding your
                                    interactions with the OS. This includes:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Semantic Input:
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                Text, documents, and files you upload to
                                                your private archive.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Metadata:
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                Technical information about how the AI
                                                processes your queries for optimization.
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                Device Identity:
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                Minimal identifiers required for secure
                                                multi-device synchronization.
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="border-l-primary bg-muted/30 my-6 border-l-4 p-4 text-base italic">
                                    &quot;We do not sell your personal archive data to
                                    third parties. Your knowledge is yours alone.&quot;
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    3. User Obligations
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    As a user of SentientArchive, you agree to maintain
                                    the security of your encryption keys and account
                                    credentials. You are responsible for all activity
                                    that occurs under your unique identifier.
                                </p>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    You agree not to use SentientArchive to store:
                                </p>
                                <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-4 text-base">
                                    <li>
                                        Illegal content or materials that violate
                                        international law.
                                    </li>
                                    <li>
                                        Malicious code, viruses, or disruptive AI
                                        agents.
                                    </li>
                                    <li>
                                        Content that infringes upon the intellectual
                                        property of others.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    4. Termination
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    You may terminate your SentientArchive account at
                                    any time. Upon termination, you will have a 30-day
                                    window to export your data in a portable JSON-LD
                                    format. After this period, all encrypted data will
                                    be permanently purged from our distributed nodes.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    5. Contact Information
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    Questions about the Terms or Privacy Policy should
                                    be sent to me:
                                </p>
                                <p className="bg-muted/40 flex w-fit items-center gap-2 rounded-full px-3 py-2">
                                    <span className="bg-muted text-muted-foreground inline-flex h-8 w-8 items-center justify-center rounded-full">
                                        <Mail className="size-5" />
                                    </span>
                                    <a
                                        href="mailto:hello@moliveda.dev"
                                        className="text-muted-foreground text-sm font-medium"
                                    >
                                        hello@moliveda.dev
                                    </a>
                                </p>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    size="icon"
                    className="fixed right-8 bottom-8 z-50 size-12 rounded-full shadow-lg"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="size-5" />
                </Button>
            )}
        </>
    );
}
