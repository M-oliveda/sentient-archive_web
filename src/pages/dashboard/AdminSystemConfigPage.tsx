import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Coins, Lock, Save } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { ISystemConfig } from "@/types/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    label: string;
    hint: string;
}> = [
    { key: "autoTag", label: "Auto-tagging", hint: "per item" },
    { key: "summarize", label: "Summarization", hint: "per 1k words" },
    { key: "flashcards", label: "Flashcards", hint: "per set" },
    { key: "ragQuery", label: "Q&A Query", hint: "per query" },
];

const FEATURE_FLAGS: Array<{
    key: keyof ISystemConfig["features"];
    label: string;
    description: string;
}> = [
    {
        key: "summarizeEnabled",
        label: "Summarization",
        description: "Allow users to generate note summaries",
    },
    {
        key: "autoTagEnabled",
        label: "Auto-Tagging",
        description: "Allow automatic tag suggestions for notes",
    },
    {
        key: "flashcardsEnabled",
        label: "Flashcards",
        description: "Allow flashcard generation from notes",
    },
    {
        key: "ragQueryEnabled",
        label: "Q&A / RAG Query",
        description: "Allow knowledge-base question answering",
    },
    {
        key: "fileExtractionEnabled",
        label: "File Extraction",
        description: "Allow PDF/TXT/MD content extraction",
    },
];

export function AdminSystemConfigPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ISystemConfig | null>(null);
    const [originalData, setOriginalData] = useState<ISystemConfig | null>(null);

    const { data: config, isLoading } = useQuery({
        queryKey: ["system-config"],
        queryFn: async () => {
            const response = await apiRequest<ISystemConfig>("/v1/admin/config");
            return response;
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
            const response = await apiRequest<ISystemConfig>("/v1/admin/config", {
                method: "POST",
                body: JSON.stringify(updates),
            });
            return response;
        },
        onSuccess: (updated) => {
            toast.success("Configuration updated successfully");
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
            setFormData(updated);
            setOriginalData(updated);
        },
        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update configuration",
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
            const current = prev!;
            const ai = current.ai ?? {
                model: "gemini-1.5-flash",
                maxTokensPerRequest: 0,
                temperature: 0,
            };
            return {
                ...current,
                ai: { ...ai, [key]: value },
            };
        });
    };

    const updateTokenCost = (
        operation: keyof ISystemConfig["tokens"]["costs"],
        value: number,
    ) => {
        setFormData((prev) => {
            if (!prev?.tokens) return prev;
            return {
                ...prev,
                tokens: {
                    ...prev.tokens,
                    costs: {
                        ...prev.tokens.costs,
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
            if (!prev?.tokens) return prev;
            return {
                ...prev,
                tokens: {
                    ...prev.tokens,
                    initialGrant: {
                        ...prev.tokens.initialGrant,
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
            if (!prev?.features) return prev;
            return {
                ...prev,
                features: {
                    ...prev.features,
                    [feature]: enabled,
                },
            };
        });
    };

    const updateRateLimit = (key: keyof ISystemConfig["rateLimits"], value: number) => {
        setFormData((prev) => {
            if (!prev?.rateLimits) return prev;
            return {
                ...prev,
                rateLimits: {
                    ...prev.rateLimits,
                    [key]: value,
                },
            };
        });
    };

    if (isLoading || !formData || !originalData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">
                    Loading system configuration...
                </div>
            </div>
        );
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

    // Fallback defaults match backend DEFAULT_CONFIG (learning/demo anti-abuse)
    const displayAi = formData.ai ?? {
        model: "gemini-3.5-flash",
        maxTokensPerRequest: 2048,
        temperature: 1.0,
        thinkingLevel: "low",
        thinkingBudget: 0,
    };
    const displayTokens = formData.tokens ?? {
        initialGrant: { production: 25, staging: 40, development: 50, local: 50 },
        costs: { summarize: 5, autoTag: 3, flashcards: 8, ragQuery: 10 },
    };
    const displayFeatures = formData.features ?? {
        summarizeEnabled: true,
        autoTagEnabled: true,
        flashcardsEnabled: true,
        ragQueryEnabled: true,
        fileExtractionEnabled: true,
    };
    const displayRateLimits = formData.rateLimits ?? {
        aiRequestsPerHour: 20,
        fileExtractionsPerDay: 10,
    };

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
                        System Configuration
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage global settings, AI models, and feature flags.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !hasChanges}
                    className="gap-2 self-start"
                >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    <Save className="size-4" />
                </Button>
            </div>

            {/* AI Configuration */}
            <section className="bg-card border-border overflow-hidden rounded-2xl border">
                <header className="border-border flex items-center gap-3 border-b px-4 py-4 sm:px-6">
                    <Bot className="text-foreground size-6" />
                    <h2 className="text-foreground text-xl font-bold">
                        AI Configuration
                    </h2>
                </header>

                <div className="space-y-8 p-4 sm:p-6">
                    <div className="space-y-2">
                        <Label htmlFor="ai-model">Default Gemini Model</Label>
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
                            Selected model will be used for all general purpose queries.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            Operational Limits
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="max-tokens">Max tokens / Op</Label>
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
                                    Max Ops / User / Hour
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
                                    File Extractions / Day
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
                                <Label htmlFor="temperature">Temperature</Label>
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
                                    Recommended: 1.0 for Gemini 3+, 0.7 for earlier
                                    models
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="thinking-level">
                                    Thinking Level (Gemini 3+)
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
                                        Minimal (Lowest latency)
                                    </NativeSelectOption>
                                    <NativeSelectOption value="low">
                                        Low (Fast responses)
                                    </NativeSelectOption>
                                    <NativeSelectOption value="medium">
                                        Medium (Balanced)
                                    </NativeSelectOption>
                                    <NativeSelectOption value="high">
                                        High (Deep reasoning)
                                    </NativeSelectOption>
                                </NativeSelect>
                                <p className="text-muted-foreground text-xs">
                                    Controls reasoning depth for Gemini 3+ models
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thinking-budget">
                                Thinking Budget (Gemini 2.5)
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
                                -1 = Dynamic, 0 = Disabled, {">"}0 = Specific token
                                count (Gemini 2.5 only)
                            </p>
                        </div>
                    </div>
                </div>

                {(formData.lastUpdatedBy || formData.lastUpdatedAt) && (
                    <footer className="border-border text-muted-foreground border-t px-4 py-3 text-xs sm:px-6">
                        {formData.lastUpdatedBy && (
                            <span>
                                Last modified by{" "}
                                <span className="text-foreground font-bold">
                                    {formData.lastUpdatedBy}
                                </span>
                            </span>
                        )}
                        {formData.lastUpdatedAt && (
                            <span>
                                {formData.lastUpdatedBy ? " on " : "Last updated "}
                                {new Date(formData.lastUpdatedAt).toLocaleDateString()}
                            </span>
                        )}
                        <span className="ml-2">· Version {formData.version}</span>
                    </footer>
                )}
            </section>

            {/* Token Economy */}
            <section className="bg-card border-border overflow-hidden rounded-2xl border">
                <header className="border-border flex items-center gap-3 border-b px-4 py-4 sm:px-6">
                    <div className="bg-success/20 flex size-10 items-center justify-center rounded-2xl">
                        <Coins className="text-success size-5" />
                    </div>
                    <h2 className="text-foreground text-xl font-bold">Token Economy</h2>
                </header>

                <div className="space-y-8 p-4 sm:p-6">
                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            Feature Costs (Tokens)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {TOKEN_COST_FIELDS.map(({ key, label, hint }) => (
                                <div
                                    key={key}
                                    className="bg-muted/40 border-border space-y-2 rounded-3xl border p-4"
                                >
                                    <Label htmlFor={`cost-${key}`}>{label}</Label>
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
                                        {hint}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                            New User Grants
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            {(
                                [
                                    { key: "production", label: "Production" },
                                    { key: "staging", label: "Staging" },
                                    { key: "development", label: "Development" },
                                    { key: "local", label: "Local" },
                                ] as const
                            ).map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={`grant-${key}`}>{label}</Label>
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
                    <h2 className="text-foreground text-xl font-bold">Feature Flags</h2>
                </header>

                <div className="divide-border divide-y">
                    {FEATURE_FLAGS.map(({ key, label, description }) => {
                        const enabled = Boolean(displayFeatures[key]);
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
                                        {description}
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
                                        {enabled ? "ON" : "OFF"}
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
