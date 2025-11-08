export interface Notification {
    notificationId: string;
    userId: string;
    type: 'request_accepted' | 'new_message' | 'request_completed' | 'request_cancelled';
    title: string;
    message: string;
    requestId?: string;
    timestamp: string;
    read: boolean;
    metadata?: Record<string, any>;
}
export declare function createNotification(userId: string, type: Notification['type'], title: string, message: string, requestId?: string, metadata?: Record<string, any>): Promise<Notification>;
export declare function getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
export declare function markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
export declare function getUnreadCount(userId: string): Promise<number>;
//# sourceMappingURL=notifications.d.ts.map