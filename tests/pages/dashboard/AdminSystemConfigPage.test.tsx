import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { AdminSystemConfigPage } from "@/pages/dashboard/AdminSystemConfigPage";
import * as tanstackQuery from "@tanstack/react-query";
import type { ISystemConfig } from "@/types/admin";
import * as apiClient from "@/lib/api-client";
import { toast } from "sonner";

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
    useMutation: jest.fn(),
}));

jest.mock("@/lib/api-client", () => ({
    apiRequest: jest.fn(),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/components/ui/switch", () => ({
    Switch: ({
        checked,
        onCheckedChange,
        disabled,
        "aria-label": ariaLabel,
    }: {
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        disabled?: boolean;
        "aria-label"?: string;
    }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            data-testid="feature-switch"
            data-checked={String(!!checked)}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
        >
            {checked ? "on" : "off"}
        </button>
    ),
}));

const mockConfig: ISystemConfig = {
    version: 1,
    ai: {
        model: "gemini-3.5-flash",
        maxTokensPerRequest: 2000,
        temperature: 1.0,
        thinkingLevel: "medium",
        thinkingBudget: -1,
    },
    tokens: {
        initialGrant: { production: 1000, staging: 500, development: 300, local: 100 },
        costs: {
            summarize: 10,
            autoTag: 5,
            flashcards: 15,
            ragQuery: 8,
        },
    },
    features: {
        summarizeEnabled: true,
        autoTagEnabled: true,
        flashcardsEnabled: true,
        ragQueryEnabled: true,
        fileExtractionEnabled: false,
    },
    fileUpload: {
        maxSizeBytes: 52428800,
        allowedTypes: ["application/pdf", "text/plain"],
    },
    rateLimits: {
        aiRequestsPerHour: 100,
        fileExtractionsPerDay: 50,
    },
    lastUpdatedAt: "2026-07-22T10:00:00Z",
    lastUpdatedBy: "admin@example.com",
};

const createWrapper = () => {
    const queryClient = new QueryClient();

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
};

describe("AdminSystemConfigPage", () => {
    let capturedQueryFn: (() => Promise<ISystemConfig>) | undefined;
    let capturedMutationOptions: {
        mutationFn?: (updates: Partial<ISystemConfig>) => Promise<ISystemConfig>;
        onSuccess?: (data: ISystemConfig) => void;
        onError?: (error: unknown) => void;
    } = {};
    const mutateAsync = jest.fn().mockResolvedValue(mockConfig);

    beforeEach(() => {
        jest.clearAllMocks();
        capturedQueryFn = undefined;
        capturedMutationOptions = {};
        mutateAsync.mockResolvedValue(mockConfig);

        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        const mockUseMutation = tanstackQuery.useMutation as jest.Mock;

        mockUseQuery.mockImplementation((options) => {
            const opts = options as { queryFn?: () => Promise<ISystemConfig> };
            capturedQueryFn = opts.queryFn;
            return {
                data: mockConfig,
                isLoading: false,
                isError: false,
                error: null,
            } as unknown as UseQueryResult<ISystemConfig>;
        });

        mockUseMutation.mockImplementation((options: unknown) => {
            capturedMutationOptions = options as typeof capturedMutationOptions;
            return {
                mutate: jest.fn(),
                mutateAsync,
                isPending: false,
            };
        });
    });

    it("renders page title and subtitle", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });
        expect(screen.getByText("System Configuration")).toBeInTheDocument();
        expect(
            screen.getByText(/Manage global settings, AI models, and feature flags/),
        ).toBeInTheDocument();
    });

    it("shows save button in header", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });
        expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });

    it("shows loading state", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Loading system configuration...")).toBeInTheDocument();
    });

    it("displays last modified metadata", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
        expect(screen.getByText(/Version 1/)).toBeInTheDocument();
    });

    it("updates token costs and saves", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const summarizeInput = screen.getByRole("spinbutton", {
            name: "Summarization",
        });
        await userEvent.clear(summarizeInput);
        await userEvent.type(summarizeInput, "25");

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    tokens: expect.objectContaining({
                        costs: expect.objectContaining({ summarize: 25 }),
                    }),
                }),
            );
        });
    });

    it("treats empty token cost input as 0", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const summarizeInput = screen.getByRole("spinbutton", {
            name: "Summarization",
        });
        await userEvent.clear(summarizeInput);

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    tokens: expect.objectContaining({
                        costs: expect.objectContaining({ summarize: 0 }),
                    }),
                }),
            );
        });
    });

    it("toggles feature flags with switches", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const switches = screen.getAllByTestId("feature-switch");
        expect(switches[0]).toHaveAttribute("data-checked", "true");
        await userEvent.click(switches[0]!);

        await waitFor(() => {
            expect(switches[0]).toHaveAttribute("data-checked", "false");
        });

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    features: expect.objectContaining({
                        summarizeEnabled: false,
                    }),
                }),
            );
        });
    });

    it("updates AI model and operational limits", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        await userEvent.selectOptions(
            screen.getByLabelText("Default Gemini Model"),
            "gemini-1.5-pro",
        );

        const maxTokens = screen.getByLabelText("Max tokens / Op");
        await userEvent.clear(maxTokens);
        await userEvent.type(maxTokens, "4096");

        const temperature = screen.getByLabelText("Temperature");
        await userEvent.clear(temperature);
        await userEvent.type(temperature, "0.5");

        await userEvent.selectOptions(
            screen.getByLabelText("Thinking Level (Gemini 3+)"),
            "high",
        );

        const thinkingBudget = screen.getByLabelText("Thinking Budget (Gemini 2.5)");
        fireEvent.change(thinkingBudget, { target: { value: "512" } });

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    ai: expect.objectContaining({
                        model: "gemini-1.5-pro",
                        maxTokensPerRequest: 4096,
                        temperature: 0.5,
                        thinkingLevel: "high",
                        thinkingBudget: 512,
                    }),
                }),
            );
        });
    });

    it("falls back thinking budget to -1 when input is empty", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const thinkingBudget = screen.getByLabelText("Thinking Budget (Gemini 2.5)");
        fireEvent.change(thinkingBudget, { target: { value: "100" } });
        fireEvent.change(thinkingBudget, { target: { value: "" } });

        expect(thinkingBudget).toHaveValue(-1);
    });

    it("updates rate limits and initial grants", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const hourly = screen.getByLabelText("Max Ops / User / Hour");
        await userEvent.clear(hourly);
        await userEvent.type(hourly, "80");

        const extractions = screen.getByLabelText("File Extractions / Day");
        await userEvent.clear(extractions);
        await userEvent.type(extractions, "40");

        const productionGrant = screen.getByLabelText("Production");
        await userEvent.clear(productionGrant);
        await userEvent.type(productionGrant, "250");

        const stagingGrant = screen.getByLabelText("Staging");
        await userEvent.clear(stagingGrant);
        await userEvent.type(stagingGrant, "150");

        const localGrant = screen.getByLabelText("Local");
        await userEvent.clear(localGrant);
        await userEvent.type(localGrant, "75");

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    rateLimits: expect.objectContaining({
                        aiRequestsPerHour: 80,
                        fileExtractionsPerDay: 40,
                    }),
                    tokens: expect.objectContaining({
                        initialGrant: expect.objectContaining({
                            production: 250,
                            staging: 150,
                            local: 75,
                        }),
                    }),
                }),
            );
        });
    });

    it("treats empty operational limit inputs as 0", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const maxTokens = screen.getByLabelText("Max tokens / Op");
        await userEvent.clear(maxTokens);

        const temperature = screen.getByLabelText("Temperature");
        await userEvent.clear(temperature);

        const hourly = screen.getByLabelText("Max Ops / User / Hour");
        await userEvent.clear(hourly);

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    ai: expect.objectContaining({
                        maxTokensPerRequest: 0,
                        temperature: 0,
                    }),
                    rateLimits: expect.objectContaining({
                        aiRequestsPerHour: 0,
                    }),
                }),
            );
        });
    });

    it("renders last updated date without modifier name", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                lastUpdatedBy: undefined,
                lastUpdatedAt: "2026-07-22T10:00:00Z",
            },
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByText(/Last updated/)).toBeInTheDocument();
        expect(screen.queryByText("admin@example.com")).not.toBeInTheDocument();
    });

    it("ignores rate limit updates when rateLimits are missing", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                rateLimits: undefined,
            } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const hourly = screen.getByLabelText("Max Ops / User / Hour");

        // Display falls back to backend default (20); updates are ignored
        expect(hourly).toHaveValue(20);

        await userEvent.clear(hourly);
        await userEvent.type(hourly, "55");

        expect(hourly).toHaveValue(20);
    });

    it("ignores initial grant updates when tokens are missing", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: { ...mockConfig, tokens: undefined } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const productionGrant = screen.getByLabelText("Production");

        // With backend defaults, production grant is 25; updates are ignored
        expect(productionGrant).toHaveValue(25);

        await userEvent.clear(productionGrant);
        await userEvent.type(productionGrant, "99");

        expect(productionGrant).toHaveValue(25);
    });

    it("falls back to default AI fields when ai is missing", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: { ...mockConfig, ai: undefined } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const modelSelect = screen.getByLabelText("Default Gemini Model");
        expect(modelSelect).toHaveValue("gemini-3.5-flash");

        const maxTokens = screen.getByLabelText("Max tokens / Op");
        await userEvent.clear(maxTokens);
        await userEvent.type(maxTokens, "1024");

        await userEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    ai: expect.objectContaining({
                        maxTokensPerRequest: 1024,
                    }),
                }),
            );
        });
    });

    it("fetches config via queryFn", async () => {
        const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<
            typeof apiClient.apiRequest
        >;
        mockApiRequest.mockResolvedValue(mockConfig);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(capturedQueryFn).toBeDefined();
        const result = await capturedQueryFn!();

        expect(mockApiRequest).toHaveBeenCalledWith("/v1/admin/config");
        expect(result).toEqual(mockConfig);
    });

    it("calls mutationFn and onSuccess handlers", async () => {
        const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<
            typeof apiClient.apiRequest
        >;
        mockApiRequest.mockResolvedValue(mockConfig);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(capturedMutationOptions.mutationFn).toBeDefined();
        await capturedMutationOptions.mutationFn!({ tokens: mockConfig.tokens });

        expect(mockApiRequest).toHaveBeenCalledWith("/v1/admin/config", {
            method: "POST",
            body: JSON.stringify({ tokens: mockConfig.tokens }),
        });

        await waitFor(() => {
            capturedMutationOptions.onSuccess?.(mockConfig);
        });

        expect(toast.success).toHaveBeenCalledWith(
            "Configuration updated successfully",
        );
    });

    it("shows Error message on mutation onError", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        capturedMutationOptions.onError?.(new Error("Save failed"));
        expect(toast.error).toHaveBeenCalledWith("Save failed");
    });

    it("shows generic error on non-Error mutation failure", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        capturedMutationOptions.onError?.("boom");
        expect(toast.error).toHaveBeenCalledWith("Failed to update configuration");
    });

    it("falls back to 0 when initialGrant values are missing", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                tokens: {
                    ...mockConfig.tokens,
                    initialGrant: undefined,
                },
            } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByLabelText("Production")).toHaveValue(0);
        expect(screen.getByLabelText("Staging")).toHaveValue(0);
        expect(screen.getByLabelText("Local")).toHaveValue(0);
    });

    it("does not save when form data is unavailable", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Loading system configuration...")).toBeInTheDocument();
        expect(mutateAsync).not.toHaveBeenCalled();
    });

    it("shows Saving... while mutation is pending", () => {
        const mockUseMutation = tanstackQuery.useMutation as jest.Mock;
        mockUseMutation.mockReturnValue({
            mutate: jest.fn(),
            mutateAsync,
            isPending: true,
        });

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("falls back to 0 for missing token costs", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                tokens: {
                    ...mockConfig.tokens,
                    costs: undefined,
                },
            } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByRole("spinbutton", { name: "Summarization" })).toHaveValue(
            0,
        );
        expect(screen.getByRole("spinbutton", { name: "Auto-tagging" })).toHaveValue(0);
    });

    it("renders without metadata when timestamps are absent", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                lastUpdatedAt: undefined,
                lastUpdatedBy: undefined,
            },
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.queryByText("admin@example.com")).not.toBeInTheDocument();
        expect(screen.queryByText(/Last modified/)).not.toBeInTheDocument();
    });

    it("includes custom model option when current model is unknown", () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: {
                ...mockConfig,
                ai: { ...mockConfig.ai, model: "custom-model-x" },
            },
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        expect(screen.getByDisplayValue("custom-model-x")).toBeInTheDocument();
    });

    it("ignores feature updates when features are missing", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: { ...mockConfig, features: undefined } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const switches = screen.getAllByTestId("feature-switch");
        // With backend defaults, features are enabled; updates are ignored
        expect(switches[0]).toHaveAttribute("data-checked", "true");

        await userEvent.click(switches[0]!);

        expect(switches[0]).toHaveAttribute("data-checked", "true");
    });

    it("ignores token cost updates when tokens are missing", async () => {
        const mockUseQuery = tanstackQuery.useQuery as jest.MockedFunction<
            typeof tanstackQuery.useQuery
        >;
        mockUseQuery.mockReturnValue({
            data: { ...mockConfig, tokens: undefined } as unknown as ISystemConfig,
            isLoading: false,
            isError: false,
            error: null,
        } as unknown as UseQueryResult<ISystemConfig>);

        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const summarizeInput = screen.getByRole("spinbutton", {
            name: "Summarization",
        });

        // With backend defaults, summarize cost is 5; updates are ignored
        expect(summarizeInput).toHaveValue(5);

        await userEvent.clear(summarizeInput);
        await userEvent.type(summarizeInput, "99");

        expect(summarizeInput).toHaveValue(5);
    });

    it("disables Save button when no changes are made", () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const saveButton = screen.getByText("Save Changes");

        // Button should be disabled initially (no changes)
        expect(saveButton).toBeDisabled();
    });

    it("enables Save button when changes are made", async () => {
        render(<AdminSystemConfigPage />, { wrapper: createWrapper() });

        const saveButton = screen.getByText("Save Changes");

        // Button should be disabled initially
        expect(saveButton).toBeDisabled();

        // Make a change to the temperature
        const temperatureInput = screen.getByLabelText("Temperature");
        await userEvent.clear(temperatureInput);
        await userEvent.type(temperatureInput, "0.5");

        // Button should now be enabled
        await waitFor(() => {
            expect(saveButton).not.toBeDisabled();
        });
    });
});
