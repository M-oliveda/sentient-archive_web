import { useTranslation } from "react-i18next";
import { useMyTokenRequests } from "@/hooks/useMyTokenRequests";
import type { IMyTokenRequest } from "@/hooks/useMyTokenRequests";

const STATUS_CLASSES: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    approved: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
    rejected: "bg-[hsl(var(--error))]/10 text-[hsl(var(--error))]",
};

function formatDate(dateString: string, language: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getReasonText(request: IMyTokenRequest, dash: string): string {
    if (request.status === "rejected" && request.reason) {
        return request.reason;
    }
    return request.justification?.trim() || dash;
}

interface IRequestRowProps {
    request: IMyTokenRequest;
}

function RequestRow({ request }: IRequestRowProps) {
    const { t, i18n } = useTranslation("tokens");

    return (
        <tr className="border-border border-b last:border-0" data-testid="request-row">
            <td className="py-3 pr-4">
                <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[request.status]}`}
                >
                    {t(`requests.statuses.${request.status}`)}
                </span>
            </td>
            <td className="text-muted-foreground py-3 pr-4 text-sm">
                {formatDate(request.createdAt, i18n.language)}
            </td>
            <td className="text-foreground py-3 pr-4 text-sm font-semibold tabular-nums">
                +{request.amount.toLocaleString()}
            </td>
            <td className="text-foreground max-w-xs py-3 text-sm">
                <span
                    className="line-clamp-2"
                    title={getReasonText(request, t("requests.dash"))}
                >
                    {getReasonText(request, t("requests.dash"))}
                </span>
            </td>
        </tr>
    );
}

export function PendingRequests() {
    const { t } = useTranslation("tokens");
    const { data: requests, isLoading } = useMyTokenRequests();

    if (isLoading) {
        return (
            <section className="space-y-4" data-testid="pending-requests-loading">
                <h2 className="text-foreground text-xl font-bold">
                    {t("requests.title")}
                </h2>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-muted h-10 animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            </section>
        );
    }

    if (!requests?.length) {
        return null;
    }

    return (
        <section className="space-y-4" data-testid="pending-requests">
            <h2 className="text-foreground text-xl font-bold">{t("requests.title")}</h2>
            <div className="overflow-x-auto">
                <table className="w-full" data-testid="pending-requests-table">
                    <thead>
                        <tr className="border-border border-b">
                            <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                                {t("requests.status")}
                            </th>
                            <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                                {t("requests.date")}
                            </th>
                            <th className="text-muted-foreground pr-4 pb-3 text-left text-xs font-medium tracking-wider uppercase">
                                {t("requests.amount")}
                            </th>
                            <th className="text-muted-foreground pb-3 text-left text-xs font-medium tracking-wider uppercase">
                                {t("requests.reason")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((r) => (
                            <RequestRow key={r.id} request={r} />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
