"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesHandler = exports.sendMessageHandler = void 0;
const messaging_1 = require("../utils/messaging");
const auth_1 = require("../utils/auth");
const notifications_1 = require("../utils/notifications");
const dynamodb_1 = require("../utils/dynamodb");
const sendMessageHandler = async (event) => {
    try {
        const fromUserId = (0, auth_1.extractUserIdFromEvent)(event);
        const requestId = event.pathParameters?.requestId;
        if (!event.body || !requestId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need request id and body' })
            };
        }
        const body = JSON.parse(event.body);
        const { toUserId, message } = body;
        if (!toUserId || !message) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need toUserId and message' })
            };
        }
        const city = event.queryStringParameters?.city || 'unknown';
        const region = event.queryStringParameters?.region || 'unknown';
        const request = await (0, dynamodb_1.getItem)(`${city}#${region}`, `request#${requestId}`);
        if (!request) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'request not found' })
            };
        }
        if (request.userId !== fromUserId && request.acceptedBy !== fromUserId) {
            return {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'cant send message for this request' })
            };
        }
        const sentMessage = await (0, messaging_1.sendMessage)(requestId, fromUserId, toUserId, message);
        await (0, notifications_1.createNotification)(toUserId, 'new_message', 'New message', `You have a new message about: "${request.title}"`, requestId, { fromUserId });
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sentMessage)
        };
    }
    catch (error) {
        console.error('Error sending message:', error);
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
exports.sendMessageHandler = sendMessageHandler;
const getMessagesHandler = async (event) => {
    try {
        const requestId = event.pathParameters?.requestId;
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        if (!requestId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need request id' })
            };
        }
        const messages = await (0, messaging_1.getMessages)(requestId);
        // mark as read when they view the messages
        await (0, messaging_1.markMessagesAsRead)(requestId, userId);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        };
    }
    catch (error) {
        console.error('Error getting messages:', error);
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
exports.getMessagesHandler = getMessagesHandler;
//# sourceMappingURL=messaging.js.map