import { useTranslation } from "react-i18next";
import { SentientArchiveLogo } from "../branding";

export function LandingFooter() {
    const { t } = useTranslation("landing");
    const currentYear = new Date().getFullYear();

    return (
        <footer className="dark:bg-brand-800 bg-brand-100/50 py-8 text-center lg:px-6 lg:py-6">
            <div className="container mx-auto flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-between">
                    <SentientArchiveLogo />
                    <p className="max-w-95 text-right text-sm">{t("footer.tagline")}</p>
                </div>
                <p>
                    <small className="text-xs">
                        {t("footer.copyrightBefore", { year: currentYear })}{" "}
                        <a
                            href="https://www.github.com/m-oliveda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            <span className="text-brand-500 hover:text-brand-500 font-medium hover:underline">
                                {t("footer.author")}
                            </span>
                        </a>{" "}
                        {t("footer.copyrightAfter")}
                    </small>
                </p>
            </div>
        </footer>
    );
}
