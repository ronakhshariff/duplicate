import { Dimension } from '@aws-sdk/client-cloudwatch';
export declare function putMetric(metricName: string, value: number, unit?: 'Count' | 'Seconds' | 'Milliseconds', dimensions?: Dimension[]): Promise<void>;
export declare function trackRequestCreated(category: string, urgency: string): Promise<void>;
export declare function trackRequestCompleted(durationSeconds: number): Promise<void>;
export declare function trackAPILatency(endpoint: string, latencyMs: number): Promise<void>;
export declare function trackActiveUser(): Promise<void>;
export declare function trackCostMetric(service: string, operation: string, count: number): Promise<void>;
//# sourceMappingURL=monitoring.d.ts.map