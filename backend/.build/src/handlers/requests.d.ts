import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const createRequest: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getRequests: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getRequest: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const acceptRequest: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const updateRequestStatus: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
//# sourceMappingURL=requests.d.ts.map