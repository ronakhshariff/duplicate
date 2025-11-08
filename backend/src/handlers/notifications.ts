import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserNotifications, markNotificationAsRead, getUnreadCount } from '../utils/notifications';
import { extractUserIdFromEvent } from '../utils/auth';

export const getNotifications = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const offset = parseInt(event.queryStringParameters?.offset || '0');
    
    // get more than we need so we can paginate
    const fetchLimit = limit + offset;
    const allNotifications = await getUserNotifications(userId, fetchLimit);
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
  } catch (error: any) {
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

export const markAsRead = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
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
    
    await markNotificationAsRead(userId, notificationId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'marked as read' })
    };
  } catch (error: any) {
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

export const getUnreadCountHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
    
    const count = await getUnreadCount(userId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ unreadCount: count })
    };
  } catch (error: any) {
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

