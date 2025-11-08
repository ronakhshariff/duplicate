import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
export const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.TABLE_NAME || 'neighbourly-dev';

// using single table design - everything in one table, partitioned by city#region
export interface RequestItem {
  PK: string; // like "toronto#ontario"
  SK: string; // request id or user id
  GSI1PK?: string; // for finding requests by status
  GSI1SK?: string; // timestamp for sorting
  requestId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    areaName?: string; // human-readable area name from location service (e.g. "Downtown, Toronto")
  };
  images?: string[]; // links to images in s3
  acceptedBy?: string; // who's helping
  createdAt: string;
  updatedAt: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  aiLabels?: string[]; // what the image recognition found
  translatedDescription?: { [language: string]: string }; // saved translations so we don't have to do it again
}

export interface UserItem {
  PK: string; // city#region
  SK: string; // user id
  userId: string;
  email: string;
  name: string;
  city: string;
  region: string;
  phone?: string;
  rating?: number;
  totalHelps?: number;
  skillsOffered?: string[]; // what they can help with
  assistanceNeeded?: string[]; // what they need help with
  bio?: string;
  preferredLanguage?: string; // language code like "en" or "es"
  createdAt: string;
  updatedAt: string;
}

export async function putItem(item: RequestItem | UserItem): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));
}

export async function getItem(PK: string, SK: string): Promise<any> {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK, SK }
  }));
  return result.Item || null; // return null instead of undefined
}

export async function queryByCity(city: string, region: string): Promise<RequestItem[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
    ExpressionAttributeValues: {
      ':pk': `${city}#${region}`,
      ':skPrefix': 'request#'
    }
  }));
  return result.Items as RequestItem[];
}

export async function queryByStatus(status: string): Promise<RequestItem[]> {
  // TODO: make sure GSI1 exists in dynamo
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :status',
    ExpressionAttributeValues: {
      ':status': `status#${status}`
    }
  }));
  return (result.Items || []) as RequestItem[];
}

export async function updateRequestStatus(
  requestId: string,
  city: string,
  region: string,
  status: string,
  acceptedBy?: string
): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `${city}#${region}`,
      SK: `request#${requestId}`
    },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, acceptedBy = :acceptedBy',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
      ':acceptedBy': acceptedBy || null
    }
  }));
}

