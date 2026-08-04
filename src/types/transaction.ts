export type TransactionType = "credit" | "debit";

export type TokenRequestStatus = "pending" | "approved" | "rejected";

export interface ITokenRequest {
    id: string;
    userId: string;
    amount: number;
    status: TokenRequestStatus;
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
}

export type TokenRequest = ITokenRequest;

export type TransactionReason =
    | "ai_summarize"
    | "ai_autotag"
    | "ai_flashcards"
    | "ai_ragquery"
    | "admin_grant"
    | "initial_grant";

export interface ITransaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    reason: TransactionReason;
    noteId: string | null;
    balanceAfter: number;
    createdAt: Date;
}

export type Transaction = ITransaction;
