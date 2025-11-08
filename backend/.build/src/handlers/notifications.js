"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCountHandler = exports.markAsRead = exports.getNotifications = void 0;
const notifications_1 = require("../utils/notifications");
const auth_1 = require("../utils/auth");
const getNotifications = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const limit = parseInt(event.queryStringParameters?.limit || '50');
        const offset = parseInt(event.queryStringParameters?.offset || '0');
        // get more than we need so we can paginate
        const fetchLimit = limit + offset;
        const allNotifications = await (0, notifications_1.getUserNotifications)(userId, fetchLimit);
        const notifications = allNotifications.slice(offset, offset + limit);
        const total = allNotifications.length; // approximate total
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notifications,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            })
        };
    }
    catch (error) {
        console.error('Error getting notifications:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const notificationId = event.pathParameters?.notificationId;
        if (!notificationId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'need notification id' })
            };
        }
        await (0, notifications_1.markNotificationAsRead)(userId, notificationId);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'marked as read' })
        };
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.markAsRead = markAsRead;
const getUnreadCountHandler = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const count = await (0, notifications_1.getUnreadCount)(userId);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ unreadCount: count })
        };
    }
    catch (error) {
        console.error('Error getting unread count:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.getUnreadCountHandler = getUnreadCountHandler;
//# sourceMappingURL=notifications.js.map