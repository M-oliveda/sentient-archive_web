import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Coins, Lock, Save } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ISystemConfig } from "@/types/admin";
import type { IApiResponse } from "@/types/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Fallback defaults match backend DEFAULT_CONFIG (learning/demo anti-abuse) */
const DEFAULT_AI: ISystemConfig["ai"] = {
    model: "gemini-3.5-flash",
    maxTokensPerRequest: 2048,
    temperature: 1.0,
    thinkingLevel: "low",
    thinkingBudget: 0,
};

const DEFAULT_TOKENS: ISystemConfig["tokens"] = {
    initialGrant: { production: 25, staging: 40, development: 50, local: 50 },
    costs: { summarize: 5, autoTag: 3, flashcards: 8, ragQuery: 10 },
};

const DEFAULT_FEATURES: ISystemConfig["features"] = {
    summarizeEnabled: true,
    autoTagEnabled: true,
    flashcardsEnabled: true,
    ragQueryEnabled: true,
    fileExtractionEnabled: true,
};

const DEFAULT_RATE_LIMITS: ISystemConfig["rateLimits"] = {
    aiRequestsPerHour: 20,
    fileExtractionsPerDay: 10,
};

// Active Gemini models as of July 2026
// See: https://ai.google.dev/gemini-api/docs/models/gemini
const AI_MODELS = [
    // Gemini 3.x - Latest generation (GA)
    { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (Latest, GA)" },
    { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash (GA)" },
    { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite (GA)" },
    { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite (GA)" },
    { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)" },
    // Gemini 2.5.x - Still active, retiring Oct 2026
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Retiring Oct 2026)" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Retiring Oct 2026)" },
    {
        value: "gemini-2.5-flash-lite",
        label: "Gemini 2.5 Flash-Lite (Retiring Oct 2026)",
    },
    // Legacy models
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Legacy)" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Legacy)" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Legacy)" },
] as const;

const TOKEN_COST_FIELDS: Array<{
    key: keyof ISystemConfig["tokens"]["costs"];
    labelKey: string;
    hintKey: string;
}> = [
    {
        key: "autoTag",
        labelKey: "systemConfig.tokens.autoTagging",
        hintKey: "systemConfig.tokens.autoTaggingHint",
    },
    {
        key: "summarize",
        labelKey: "systemConfig.tokens.summarization",
        hintKey: "systemConfig.tokens.summarizationHint",
    },
    {
        key: "flashcards",
        labelKey: "systemConfig.tokens.flashcards",
        hintKey: "systemConfig.tokens.flashcardsHint",
    },
    {
        key: "ragQuery",
        labelKey: "systemConfig.tokens.ragQuery",
        hintKey: "systemConfig.tokens.ragQueryHint",
    },
];

const FEATURE_FLAGS: Array<{
    key: keyof ISystemConfig["features"];
    labelKey: string;
    descriptionKey: string;
}> = [
    {
        key: "summarizeEnabled",
        labelKey: "systemConfig.features.summarization",
        descriptionKey: "systemConfig.features.summarizationDesc",
    },
    {
        key: "autoTagEnabled",
        labelKey: "systemConfig.features.autoTagging",
        descriptionKey: "systemConfig.features.autoTaggingDesc",
    },
    {
        key: "flashcardsEnabled",
        labelKey: "systemConfig.features.flashcards",
        descriptionKey: "systemConfig.features.flashcardsDesc",
    },
    {
        key: "ragQueryEnabled",
        labelKey: "systemConfig.features.ragQuery",
        descriptionKey: "systemConfig.features.ragQueryDesc",
    },
    {
        key: "fileExtractionEnabled",
        labelKey: "systemConfig.features.fileExtraction",
        descriptionKey: "systemConfig.features.fileExtractionDesc",
    },
];

export function AdminSystemConfigPage() {
    const { t } = useTranslation("admin");
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ISystemConfig | null>(null);
    const [originalData, setOriginalData] = useState<ISystemConfig | null>(null);

    const { data: config, isLoading } = useQuery({
        queryKey: ["system-config"],
        queryFn: async () => {
            const response =
                await apiRequest<IApiResponse<ISystemConfig>>("/v1/admin/config");
            return response.data;
        },
    });

    useEffect(() => {
        if (config) {
            setFormData(config);
            setOriginalData(config);
        }
    }, [config]);

    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<ISystemConfig>) => {
            const response = await apiRequest<IApiResponse<ISystemConfig>>(
                "/v1/admin/config",
                {
                    method: "POST",
                    body: JSON.stringify(updates),
                },
            );
            return response.data;
        },
        onSuccess: (updated) => {
            toast.success(t("systemConfig.saveSuccess"));
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
            queryClient.invalidateQueries({ queryKey: ["client-config"] });
            setFormData(updated);
            setOriginalData(updated);
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : t("systemConfig.saveError"),
            );
        },
    });

    const handleSave = async () => {
        await updateMutation.mutateAsync({
            ai: formData!.ai,
            tokens: formData!.tokens,
            features: formData!.features,
            rateLimits: formData!.rateLimits,
        });
    };

    const updateAiField = <K extends keyof ISystemConfig["ai"]>(
        key: K,
        value: ISystemConfig["ai"][K],
    ) => {
        setFormData((prev) => {
            /* istanbul ignore next - defensive guard, prev is never null when form renders */
            if (!prev) return prev;
            const ai = prev.ai ?? DEFAULT_AI;
            return {
                ...prev,
                ai: { ...ai, [key]: value },
            };
        });
    };

    const updateTokenCost = (
        operation: keyof ISystemConfig["tokens"]["costs"],
        value: number,
    ) => {
        setFormData((prev) => {
            /* istanbul ignore next - defensive guard, prev is never null when form renders */
            if (!prev) return prev;
            const tokens = prev.tokens ?? DEFAULT_TOKENS;
            return {
                ...prev,
                tokens: {
                    ...tokens,
                    costs: {
                        ...tokens.costs,
                        [operation]: value,
                    },
                },
            };
        });
    };

    const updateInitialGrant = (
        env: keyof ISystemConfig["tokens"]["initialGrant"],
        value: number,
    ) => {
        setFormData((prev) => {
            /* istanbul ignore next - defensive guard, prev is never null when form renders */
            if (!prev) return prev;
            const tokens = prev.tokens ?? DEFAULT_TOKENS;
            return {
                ...prev,
                tokens: {
                    ...tokens,
                    initialGrant: {
                        ...tokens.initialGrant,
                        [env]: value,
                    },
                },
            };
        });
    };

    const updateFeatureFlag = (
        feature: keyof ISystemConfig["features"],
        enabled: boolean,
    ) => {
        setFormData((prev) => {
            /* istanbul ignore next - defensive guard, prev is never null when form renders */
            if (!prev) return prev;
            const features = prev.features ?? DEFAULT_FEATURES;
            return {
                ...prev,
                features: {
                    ...features,
                    [feature]: enabled,
                },
            };
        });
    };

    const updateRateLimit = (key: keyof ISystemConfig["rateLimits"], value: number) => {
        setFormData((prev) => {
            /* istanbul ignore next - defensive guard, prev is never null when form renders */
            if (!prev) return prev;
            const rateLimits = prev.rateLimits ?? DEFAULT_RATE_LIMITS;
            return {
                ...prev,
                rateLimits: {
                    ...rateLimits,
                    [key]: value,
                },
            };
        });
    };

    if (isLoading || !formData || !originalData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">{t("systemConfig.loading")}</div>
            </div>
        );
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    const displayAi = formData.ai ?? DEFAULT_AI;
    const displayTokens = formData.tokens ?? DEFAULT_TOKENS;
    const displayFeatures = formData.features ?? DEFAULT_FEATURES;
    const displayRateLimits = formData.rateLimits ?? DEFAULT_RATE_LIMITS;

    const modelOptions = AI_MODELS.some((m) => m.value === displayAi.model)
        ? AI_MODELS
        : [
              {
                  value: displayAi.model,
                  label: displayAi.model,
              },
              ...AI_MODELS,
          ];

    return (
        <section className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <h1 className="text-foreground text-4xl font-bold tracking-tight">
                        {t("systemConfig.title")}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t("systemConfig.subtitle")}
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !hasChanges}
                    className="gap-2 self-start"
                >
                    {updateMutation.isPending
                        ? t("systemConfig.saving")
                        : t("systemConfig.save")}
                    <Save className="size-4" />
                </Button>
            </div>

            {/* AI Configuration */}
            <section className="bg-card border-border overflow-hidden rounded-2xl border">
                <header className="border-border flex items-center gap-3 border-b px-4 py-4 sm:px-6">
                    <Bot className="text-foreground size-6" />
                    <h2 className="text-foreground text-xl font-bold">
                        {t("systemConfig.ai.title")}
                    </h2>
                </header>

                <div className="space-y-8 p-4 sm:p-6">
                    <div className="space-y-2">
                        <Label htmlFor="ai-model">{t("systemConfig.ai.model")}</Label>
                        <NativeSelect
                            id="ai-model"
                            className="w-full"
                            value={displayAi.model}
                            onChange={(e) => updateAiField("model", e.target.value)}
                            disabled={updateMutation.isPending}
                            aria-describedby="ai-model-hint"
                        >
                            {modelOptions.map((option) => (
                                <NativeSelectOption
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                        <p id="ai-model-hint" className="text-muted-foreground text-xs">
                            {t("systemConfig.ai.modelHint")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            {t("systemConfig.ai.operationalLimits")}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="max-tokens">
                                    {t("systemConfig.ai.maxTokens")}
                                </Label>
                                <Input
                                    id="max-tokens"
                                    type="number"
                                    min="1"
                                    value={displayAi.maxTokensPerRequest}
                                    onChange={(e) =>
                                        updateAiField(
                                            "maxTokensPerRequest",
                                            parseInt(e.target.value, 10) || 0,
                                        )
                                    }
                                    disabled={updateMutation.isPending}
                                    className="[appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ai-requests-hour">
                                    {t("systemConfig.ai.maxOpsHour")}
                                </Label>
                                <Input
                                    id="ai-requests-hour"
                                    type="number"
                                    min="1"
                                    value={displayRateLimits.aiRequestsPerHour}
                                    onChange={(e) =>
                                        updateRateLimit(
                                            "aiRequestsPerHour",
                                            parseInt(e.target.value, 10) || 0,
                                        )
                                    }
                                    disabled={updateMutation.isPending}
                                    className="[appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file-extractions-day">
                                    {t("systemConfig.ai.fileExtractionsDay")}
                                </Label>
                                <Input
                                    id="file-extractions-day"
                                    type="number"
                                    min="1"
                                    value={displayRateLimits.fileExtractionsPerDay}
                                    onChange={(e) =>
                                        updateRateLimit(
                                            "fileExtractionsPerDay",
                                            parseInt(e.target.value, 10) || 0,
                                        )
                                    }
                                    disabled={updateMutation.isPending}
                                    className="[appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="temperature">
                                    {t("systemConfig.ai.temperature")}
                                </Label>
                                <Input
                                    id="temperature"
                                    type="number"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={displayAi.temperature}
                                    onChange={(e) =>
                                        updateAiField(
                                            "temperature",
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    disabled={updateMutation.isPending}
                                    className="[appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <p className="text-muted-foreground text-xs">
                                    {t("systemConfig.ai.temperatureHint")}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="thinking-level">
                                    {t("systemConfig.ai.thinkingLevel")}
                                </Label>
                                <NativeSelect
                                    id="thinking-level"
                                    className="w-full"
                                    value={displayAi.thinkingLevel ?? "medium"}
                                    onChange={(e) =>
                                        updateAiField("thinkingLevel", e.target.value)
                                    }
                                    disabled={updateMutation.isPending}
                                >
                                    <NativeSelectOption value="minimal">
                                        {t("systemConfig.ai.thinkingMinimal")}
                                    </NativeSelectOption>
                                    <NativeSelectOption value="low">
                                        {t("systemConfig.ai.thinkingLow")}
                                    </NativeSelectOption>
                                    <NativeSelectOption value="medium">
                                        {t("systemConfig.ai.thinkingMedium")}
                                    </NativeSelectOption>
                                    <NativeSelectOption value="high">
                                        {t("systemConfig.ai.thinkingHigh")}
                                    </NativeSelectOption>
                                </NativeSelect>
                                <p className="text-muted-foreground text-xs">
                                    {t("systemConfig.ai.thinkingLevelHint")}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thinking-budget">
                                {t("systemConfig.ai.thinkingBudget")}
                            </Label>
                            <Input
                                id="thinking-budget"
                                type="number"
                                min="-1"
                                value={displayAi.thinkingBudget ?? -1}
                                onChange={(e) =>
                                    updateAiField(
                                        "thinkingBudget",
                                        parseInt(e.target.value, 10) || -1,
                                    )
                                }
                                disabled={updateMutation.isPending}
                                className="max-w-xs [appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <p className="text-muted-foreground text-xs">
                                {t("systemConfig.ai.thinkingBudgetHint")}
                            </p>
                        </div>
                    </div>
                </div>

                {(formData.lastUpdatedBy || formData.lastUpdatedAt) && (
                    <footer className="border-border text-muted-foreground border-t px-4 py-3 text-xs sm:px-6">
                        {formData.lastUpdatedBy && (
                            <span>
                                {t("systemConfig.meta.lastModifiedBy")}{" "}
                                <span className="text-foreground font-bold">
                                    {formData.lastUpdatedBy}
                                </span>
                            </span>
                        )}
                        {formData.lastUpdatedAt && (
                            <span>
                                {formData.lastUpdatedBy
                                    ? ` ${t("systemConfig.meta.on")} `
                                    : `${t("systemConfig.meta.lastUpdated")} `}
                                {new Date(formData.lastUpdatedAt).toLocaleDateString()}
                            </span>
                        )}
                        <span className="ml-2">
                            ·{" "}
                            {t("systemConfig.meta.version", {
                                version: formData.version,
                            })}
                        </span>
                    </footer>
                )}
            </section>

            {/* Token Economy */}
            <section className="bg-card border-border overflow-hidden rounded-2xl border">
                <header className="border-border flex items-center gap-3 border-b px-4 py-4 sm:px-6">
                    <div className="bg-success/20 flex size-10 items-center justify-center rounded-2xl">
                        <Coins className="text-success size-5" />
                    </div>
                    <h2 className="text-foreground text-xl font-bold">
                        {t("systemConfig.tokens.title")}
                    </h2>
                </header>

                <div className="space-y-8 p-4 sm:p-6">
                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            {t("systemConfig.tokens.featureCosts")}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {TOKEN_COST_FIELDS.map(({ key, labelKey, hintKey }) => (
                                <div
                                    key={key}
                                    className="bg-muted/40 border-border space-y-2 rounded-3xl border p-4"
                                >
                                    <Label htmlFor={`cost-${key}`}>{t(labelKey)}</Label>
                                    <Input
                                        id={`cost-${key}`}
                                        type="number"
                                        min="0"
                                        value={displayTokens.costs?.[key] ?? 0}
                                        onChange={(e) =>
                                            updateTokenCost(
                                                key,
                                                parseInt(e.target.value, 10) || 0,
                                            )
                                        }
                                        disabled={updateMutation.isPending}
                                        className="[appearance:textfield] rounded-xl text-xl font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        {t(hintKey)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            {t("systemConfig.tokens.newUserGrants")}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            {(
                                [
                                    {
                                        key: "production",
                                        labelKey: "systemConfig.tokens.production",
                                    },
                                    {
                                        key: "staging",
                                        labelKey: "systemConfig.tokens.staging",
                                    },
                                    {
                                        key: "development",
                                        labelKey: "systemConfig.tokens.development",
                                    },
                                    {
                                        key: "local",
                                        labelKey: "systemConfig.tokens.local",
                                    },
                                ] as const
                            ).map(({ key, labelKey }) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={`grant-${key}`}>
                                        {t(labelKey)}
                                    </Label>
                                    <Input
                                        id={`grant-${key}`}
                                        type="number"
                                        min="0"
                                        value={displayTokens.initialGrant?.[key] ?? 0}
                                        onChange={(e) =>
                                            updateInitialGrant(
                                                key,
                                                parseInt(e.target.value, 10) || 0,
                                            )
                                        }
                                        disabled={updateMutation.isPending}
                                        className="[appearance:textfield] rounded-3xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Flags */}
            <section className="bg-card border-border overflow-hidden rounded-2xl border">
                <header className="border-border flex items-center gap-3 border-b px-4 py-4 sm:px-6">
                    <Lock className="text-foreground size-6" />
                    <h2 className="text-foreground text-xl font-bold">
                        {t("systemConfig.features.title")}
                    </h2>
                </header>

                <div className="divide-border divide-y">
                    {FEATURE_FLAGS.map(({ key, labelKey, descriptionKey }) => {
                        const enabled = Boolean(displayFeatures[key]);
                        const label = t(labelKey);
                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
                            >
                                <div className="min-w-0 space-y-1">
                                    <p className="text-foreground text-sm font-medium">
                                        {label}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {t(descriptionKey)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            "text-xs font-medium",
                                            enabled
                                                ? "text-success"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {enabled
                                            ? t("systemConfig.features.on")
                                            : t("systemConfig.features.off")}
                                    </span>
                                    <Switch
                                        checked={enabled}
                                        onCheckedChange={(checked) =>
                                            updateFeatureFlag(key, checked)
                                        }
                                        disabled={updateMutation.isPending}
                                        aria-label={label}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </section>
    );
}
