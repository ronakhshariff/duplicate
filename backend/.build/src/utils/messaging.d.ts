export interface Message {
    messageId: string;
    requestId: string;
    fromUserId: string;
    toUserId: string;
    message: string;
    timestamp: string;
    read: boolean;
}
export interface ChatThread {
    requestId: string;
    participant1: string;
    participant2: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}
export declare function sendMessage(requestId: string, fromUserId: string, toUserId: string, message: string): Promise<Message>;
export declare function getMessages(requestId: string): Promise<Message[]>;
export declare function markMessagesAsRead(requestId: string, userId: string): Promise<void>;
export declare function getUserChatThreads(userId: string): Promise<ChatThread[]>;
//# sourceMappingURL=messaging.d.ts.map