import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPresignedUploadUrl, generateImageKey, uploadToS3 } from '../utils/s3';
import { extractUserIdFromEvent } from '../utils/auth';

export const uploadImage = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
    
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need body' })
      };
    }
    
    const body = JSON.parse(event.body);
    const { requestId, filename, contentType, imageData } = body;
    
    if (!filename || !contentType) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need filename and content type' })
      };
    }
    
    if (!imageData) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need image data' })
      };
    }
    
    const key = generateImageKey(userId, requestId || 'temp', filename);
    const url = await uploadToS3(key, Buffer.from(imageData, 'base64'), contentType);
    
    console.log('uploaded image:', key);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        url,
        key
      })
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
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

export const getPresignedUrl = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
    const requestId = event.queryStringParameters?.requestId || 'temp';
    const filename = event.queryStringParameters?.filename;
    const contentType = event.queryStringParameters?.contentType || 'image/jpeg';
    
    if (!filename) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need filename' })
      };
    }
    
    const key = generateImageKey(userId, requestId, filename);
    const presignedUrl = await getPresignedUploadUrl(key, contentType);
    
    // return the presigned url so frontend can upload directly
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        presignedUrl,
        key,
        url: `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${key}`
      })
    };
  } catch (error: any) {
    console.error('Error getting presigned URL:', error);
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

