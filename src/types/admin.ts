/**
 * Admin Types
 *
 * Type definitions for admin-related data structures
 */

import type { User } from "./user";

export interface IAdminUser extends User {
    createdAt?: string | null;
    lastLoginAt?: string | null;
    updatedAt?: string | null;
    totalTokensGranted?: number;
    totalTokensSpent?: number;
}

export interface ITokenRequest {
    id: string;
    userId: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    userEmail?: string;
    userDisplayName?: string;
    userName?: string;
    userAvatarUrl?: string;
    currentBalance?: number;
    justification?: string;
    lastGrantAt?: string;
    isUrgent?: boolean;
}

export interface IAdminAnalytics {
    users: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        clients: number;
    };
    notes: {
        total: number;
    };
    tokens: {
        totalGranted: number;
        totalSpent: number;
        netBalance: number;
    };
    aiOperations: {
        total: number;
        byType: {
            summarize: number;
            autoTag: number;
            flashcards: number;
            ragQuery: number;
        };
    };
    trends?: {
        aiOperationsOverTime: Array<{ date: string; count: number }>;
        tokenUsageOverTime: Array<{ date: string; granted: number; spent: number }>;
        userGrowthOverTime: Array<{
            date: string;
            totalUsers: number;
            newUsers: number;
        }>;
    };
    dateRange?: "7d" | "30d" | "90d";
}

export type ServiceStatus = "Operational" | "Degraded" | "Down" | "In Danger";

export interface IAdminStatsResponse {
    totalUsers: number;
    totalNotes: number;
    totalTokens: number;
    totalAIOperations: number;
    systemHealth: Array<{
        service: string;
        status: ServiceStatus;
    }>;
    recentActivity: Array<{
        id: string;
        name: string;
        action: string;
        timeAgo: string;
    }>;
}

export interface ISystemConfig {
    ai: {
        model: string;
        maxTokensPerRequest: number;
        temperature: number;
        /**
         * Thinking level for Gemini 3+ models
         * Values: "minimal" | "low" | "medium" | "high"
         * See: https://ai.google.dev/gemini-api/docs/thinking
         */
        thinkingLevel?: string;
        /**
         * Thinking budget for Gemini 2.5 models (numeric)
         * -1 = dynamic, 0 = disabled, >0 = specific token count
         * See: https://ai.google.dev/gemini-api/docs/thinking
         */
        thinkingBudget?: number;
    };
    tokens: {
        initialGrant: {
            production: number;
            staging: number;
            development: number;
            local: number;
        };
        costs: {
            summarize: number;
            autoTag: number;
            flashcards: number;
            ragQuery: number;
        };
    };
    features: {
        summarizeEnabled: boolean;
        autoTagEnabled: boolean;
        flashcardsEnabled: boolean;
        ragQueryEnabled: boolean;
        fileExtractionEnabled: boolean;
    };
    fileUpload: {
        maxSizeBytes: number;
        allowedTypes: string[];
    };
    rateLimits: {
        aiRequestsPerHour: number;
        fileExtractionsPerDay: number;
    };
    version: number;
    lastUpdatedBy?: string;
    lastUpdatedAt?: string;
}

export interface IActivityLog {
    id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId: string;
    timestamp: string;
    result: "success" | "failure";
    details?: Record<string, unknown>;
}

export interface IAdminActivityEntry {
    id: string;
    category: "ai" | "tokens" | "notes" | "folders";
    title: string;
    description: string;
    createdAt: string;
    iconHint: "bot" | "coins" | "file-text" | "pencil" | "folder";
    userId: string;
    userEmail: string;
    userName?: string;
}
