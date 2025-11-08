interface Buffer {
    [key: number]: number;
    length: number;
}
declare const Buffer: {
    from(data: string, encoding?: string): Buffer;
    from(data: ArrayBuffer): Buffer;
    new (data: string, encoding?: string): Buffer;
};
export interface SentimentResult {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    confidence: number;
}
export declare function detectSentiment(text: string, languageCode?: string): Promise<SentimentResult>;
export declare function detectEntities(text: string, languageCode?: string): Promise<string[]>;
export declare function translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string>;
export interface ImageLabels {
    labels: string[];
    text?: string[];
}
export declare function analyzeImage(imageBytes: Buffer): Promise<ImageLabels>;
export interface CategoryResult {
    category: string;
    confidence: number;
}
export declare function autoCategorizeRequest(text: string): Promise<CategoryResult>;
export interface PriorityResult {
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    confidence: number;
    reason?: string;
}
export declare function detectPriority(text: string): Promise<PriorityResult>;
export {};
//# sourceMappingURL=ai.d.ts.map