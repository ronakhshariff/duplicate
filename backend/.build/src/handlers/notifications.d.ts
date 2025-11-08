import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const getNotifications: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const markAsRead: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getUnreadCountHandler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=notifications.d.ts.map