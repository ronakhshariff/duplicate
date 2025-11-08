"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getUserNotifications = getUserNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.getUnreadCount = getUnreadCount;
const dynamodb_1 = require("./dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// creates a new notification for someone (when request accepted, message received, etc)
async function createNotification(userId, type, title, message, requestId, metadata) {
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const notification = {
        notificationId,
        userId,
        type,
        title,
        message,
        requestId,
        timestamp,
        read: false,
        metadata
    };
    await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: dynamodb_1.TABLE_NAME,
        Item: {
            PK: `user#${userId}`,
            SK: `notification#${notificationId}`,
            GSI1PK: `user#${userId}`,
            GSI1SK: timestamp,
            ...notification
        }
    }));
    return notification;
}
// gets all notifications for a user (newest first)
async function getUserNotifications(userId, limit = 50) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: dynamodb_1.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': `user#${userId}`,
            ':skPrefix': 'notification#'
        },
        ScanIndexForward: false, // newest first
        Limit: limit
    }));
    return (result.Items || []);
}
// marks a notification as read
async function markNotificationAsRead(userId, notificationId) {
    const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: dynamodb_1.TABLE_NAME,
        Key: {
            PK: `user#${userId}`,
            SK: `notification#${notificationId}`
        }
    }));
    // @ts-ignore - dynamodb types are weird sometimes
    const notification = result.Item;
    if (notification) {
        await dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: dynamodb_1.TABLE_NAME,
            Item: {
                ...notification,
                read: true
            }
        }));
    }
}
// counts how many unread notifications someone has
// hack: gets first 100 and counts, might miss some if they have more
async function getUnreadCount(userId) {
    const notifications = await getUserNotifications(userId, 100);
    return notifications.filter(n => !n.read).length;
}
//# sourceMappingURL=notifications.js.map