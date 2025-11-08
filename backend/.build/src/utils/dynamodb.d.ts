import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
export declare const docClient: DynamoDBDocumentClient;
export declare const TABLE_NAME: string;
export interface RequestItem {
    PK: string;
    SK: string;
    GSI1PK?: string;
    GSI1SK?: string;
    requestId: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    location: {
        latitude: number;
        longitude: number;
        address?: string;
        areaName?: string;
    };
    images?: string[];
    acceptedBy?: string;
    createdAt: string;
    updatedAt: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    aiLabels?: string[];
    translatedDescription?: {
        [language: string]: string;
    };
}
export interface UserItem {
    PK: string;
    SK: string;
    userId: string;
    email: string;
    name: string;
    city: string;
    region: string;
    phone?: string;
    rating?: number;
    totalHelps?: number;
    skillsOffered?: string[];
    assistanceNeeded?: string[];
    bio?: string;
    preferredLanguage?: string;
    createdAt: string;
    updatedAt: string;
}
export declare function putItem(item: RequestItem | UserItem): Promise<void>;
export declare function getItem(PK: string, SK: string): Promise<any>;
export declare function queryByCity(city: string, region: string): Promise<RequestItem[]>;
export declare function queryByStatus(status: string): Promise<RequestItem[]>;
export declare function updateRequestStatus(requestId: string, city: string, region: string, status: string, acceptedBy?: string): Promise<void>;
//# sourceMappingURL=dynamodb.d.ts.map