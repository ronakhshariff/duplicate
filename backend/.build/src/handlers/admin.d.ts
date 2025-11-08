import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export interface AdminStats {
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    totalVolunteers: number;
    requestsByCategory: Record<string, number>;
    requestsByUrgency: Record<string, number>;
    requestsByStatus: Record<string, number>;
    recentActivity: number;
}
export declare const getStats: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getHeatmapData: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=admin.d.ts.map