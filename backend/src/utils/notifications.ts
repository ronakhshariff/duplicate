import { docClient, TABLE_NAME } from './dynamodb';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

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

// creates a new notification for someone (when request accepted, message received, etc)
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  requestId?: string,
  metadata?: Record<string, any>
): Promise<Notification> {
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const notification: Notification = {
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
  
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
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
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<Notification[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `user#${userId}`,
      ':skPrefix': 'notification#'
    },
    ScanIndexForward: false, // newest first
    Limit: limit
  }));
  
  return (result.Items || []) as Notification[];
}

// marks a notification as read
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `user#${userId}`,
      SK: `notification#${notificationId}`
    }
  }));
  
  // @ts-ignore - dynamodb types are weird sometimes
  const notification = result.Item;
  if (notification) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...notification,
        read: true
      }
    }));
  }
}

// counts how many unread notifications someone has
// hack: gets first 100 and counts, might miss some if they have more
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getUserNotifications(userId, 100);
  return notifications.filter(n => !n.read).length;
}

