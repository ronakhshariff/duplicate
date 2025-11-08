export declare function getUserFromToken(token: string): Promise<{
    userId: string;
    email: string;
} | null>;
export declare function extractUserIdFromEvent(event: any): string;
export declare function extractUserEmailFromEvent(event: any): string;
//# sourceMappingURL=auth.d.ts.map