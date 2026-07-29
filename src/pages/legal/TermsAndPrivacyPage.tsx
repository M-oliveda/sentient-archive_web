import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, CheckCircle2, Mail, Scale } from "lucide-react";
import { PublicNavbar } from "@/components/layout";

export function TermsAndPrivacyPage() {
    const { t } = useTranslation("legal");
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
                                <span className="text-sm">{t("page.eyebrow")}</span>
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                {t("page.title")}
                            </h1>
                            <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                <span>{t("page.version")}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{t("page.lastUpdated")}</span>
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-8 pb-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    {t("page.introduction.title")}
                                </h2>
                                <div className="text-muted-foreground space-y-3 text-base leading-relaxed">
                                    <p>{t("page.introduction.p1")}</p>
                                    <p>{t("page.introduction.p2")}</p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    {t("page.dataCollection.title")}
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {t("page.dataCollection.intro")}
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                {t(
                                                    "page.dataCollection.items.semanticInput.label",
                                                )}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                {t(
                                                    "page.dataCollection.items.semanticInput.description",
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                {t(
                                                    "page.dataCollection.items.metadata.label",
                                                )}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                {t(
                                                    "page.dataCollection.items.metadata.description",
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="text-primary mt-1 size-5 shrink-0" />
                                        <div>
                                            <span className="font-medium">
                                                {t(
                                                    "page.dataCollection.items.deviceIdentity.label",
                                                )}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                {t(
                                                    "page.dataCollection.items.deviceIdentity.description",
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                                <div className="border-l-primary bg-muted/30 my-6 border-l-4 p-4 text-base italic">
                                    {t("page.dataCollection.quote")}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    {t("page.userObligations.title")}
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {t("page.userObligations.p1")}
                                </p>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {t("page.userObligations.p2")}
                                </p>
                                <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-4 text-base">
                                    <li>{t("page.userObligations.items.illegal")}</li>
                                    <li>{t("page.userObligations.items.malicious")}</li>
                                    <li>{t("page.userObligations.items.ip")}</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    {t("page.termination.title")}
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {t("page.termination.p1")}
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold">
                                    {t("page.contact.title")}
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {t("page.contact.p1")}
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
                    aria-label={t("page.scrollToTop")}
                >
                    <ArrowUp className="size-5" />
                </Button>
            )}
        </>
    );
}
