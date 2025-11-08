import { docClient, TABLE_NAME } from './dynamodb';
import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

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

// sends a message between two users on a request
export async function sendMessage(
  requestId: string,
  fromUserId: string,
  toUserId: string,
  message: string
): Promise<Message> {
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const messageItem: Message = {
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
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `request#${requestId}`,
      SK: `message#${messageId}`,
      ...messageItem
    }
  }));
  
  return messageItem;
}

// gets all the messages for a specific request
export async function getMessages(requestId: string): Promise<Message[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `request#${requestId}`,
      ':skPrefix': 'message#'
    },
    ScanIndexForward: true // oldest first
  }));
  
  return (result.Items || []) as Message[];
}

// marks messages as read when user opens the chat
export async function markMessagesAsRead(requestId: string, userId: string): Promise<void> {
  const messages = await getMessages(requestId);
  const unreadMessages = messages.filter(m => m.toUserId === userId && !m.read);
  
  // update each one individually (could be faster with batch write but this works for now)
  for (const message of unreadMessages) {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
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
export async function getUserChatThreads(userId: string): Promise<ChatThread[]> {
  // would need a different index to query by user
  // for now just return empty, we can add this later if needed
  return [];
}

