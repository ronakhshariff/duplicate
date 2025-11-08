"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getMessages = getMessages;
exports.markMessagesAsRead = markMessagesAsRead;
exports.getUserChatThreads = getUserChatThreads;
const dynamodb_1 = require("./dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// sends a message between two users on a request
async function sendMessage(requestId, fromUserId, toUserId, message) {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const messageItem = {
        messageId,
        requestId,
        fromUserId,
        toUserId,
        message,
        timestamp,
        read: false
    };
    // save it to the db, grouped by request so we can find all messages for a request easily
    // TODO: might want a GSI to find all messages for a user
    await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: dynamodb_1.TABLE_NAME,
        Item: {
            PK: `request#${requestId}`,
            SK: `message#${messageId}`,
            ...messageItem
        }
    }));
    return messageItem;
}
// gets all the messages for a specific request
async function getMessages(requestId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: dynamodb_1.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': `request#${requestId}`,
            ':skPrefix': 'message#'
        },
        ScanIndexForward: true // oldest first
    }));
    return (result.Items || []);
}
// marks messages as read when user opens the chat
async function markMessagesAsRead(requestId, userId) {
    const messages = await getMessages(requestId);
    const unreadMessages = messages.filter(m => m.toUserId === userId && !m.read);
    // update each one individually (could be faster with batch write but this works for now)
    for (const message of unreadMessages) {
        await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: dynamodb_1.TABLE_NAME,
            Item: {
                PK: `request#${requestId}`,
                SK: `message#${message.messageId}`,
                ...message,
                read: true
            }
        }));
    }
}
// would get all chat threads for a user but we need to set up the index first
// TODO: add GSI for this later
async function getUserChatThreads(userId) {
    // would need a different index to query by user
    // for now just return empty, we can add this later if needed
    return [];
}
//# sourceMappingURL=messaging.js.map