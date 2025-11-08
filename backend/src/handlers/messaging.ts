import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendMessage, getMessages, markMessagesAsRead } from '../utils/messaging';
import { extractUserIdFromEvent } from '../utils/auth';
import { createNotification } from '../utils/notifications';
import { getItem } from '../utils/dynamodb';

export const sendMessageHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const fromUserId = extractUserIdFromEvent(event);
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
    const request = await getItem(`${city}#${region}`, `request#${requestId}`);
    
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
    
    const sentMessage = await sendMessage(requestId, fromUserId, toUserId, message);
    
    await createNotification(
      toUserId,
      'new_message',
      'New message',
      `You have a new message about: "${request.title}"`,
      requestId,
      { fromUserId }
    );
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sentMessage)
    };
  } catch (error: any) {
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

export const getMessagesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const requestId = event.pathParameters?.requestId;
    const userId = extractUserIdFromEvent(event);
    
    if (!requestId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need request id' })
      };
    }
    
    const messages = await getMessages(requestId);
    
    // mark as read when they view the messages
    await markMessagesAsRead(requestId, userId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    };
  } catch (error: any) {
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

