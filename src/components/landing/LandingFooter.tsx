import { SentientArchiveLogo } from "../branding";

export function LandingFooter() {
    return (
        <footer className="dark:bg-brand-800 bg-brand-100/50 py-8 text-center lg:px-6 lg:py-6">
            <div className="container mx-auto flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-between">
                    <SentientArchiveLogo />
                    <p className="max-w-[380px] text-right text-sm">
                        AI-Powered Knowledge OS. Capturing insights for the future of
                        intelligence.
                    </p>
                </div>
                <p>
                    <small className="text-xs">
                        © 2025 SentientArchive. All rights reserved. A{" "}
                        <a
                            href="https://www.github.com/m-oliveda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            <span className="text-brand-500 hover:text-brand-500 mr-1 font-medium hover:underline">
                                M-Oliveda
                            </span>
                        </a>
                        project.
                    </small>
                </p>
            </div>
        </footer>
    );
}
