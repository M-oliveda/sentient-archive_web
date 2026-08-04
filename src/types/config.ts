/**
 * Client-facing system configuration (safe subset of admin config)
 */

export interface IFeatureFlags {
    summarizeEnabled: boolean;
    autoTagEnabled: boolean;
    flashcardsEnabled: boolean;
    ragQueryEnabled: boolean;
    fileExtractionEnabled: boolean;
}

export interface ITokenCosts {
    summarize: number;
    autoTag: number;
    flashcards: number;
    ragQuery: number;
}

export interface IClientConfig {
    features: IFeatureFlags;
    tokens: {
        costs: ITokenCosts;
    };
}

export const DEFAULT_FEATURE_FLAGS: IFeatureFlags = {
    summarizeEnabled: true,
    autoTagEnabled: true,
    flashcardsEnabled: true,
    ragQueryEnabled: true,
    fileExtractionEnabled: true,
};

export const DEFAULT_TOKEN_COSTS: ITokenCosts = {
    summarize: 5,
    autoTag: 3,
    flashcards: 8,
    ragQuery: 10,
};
