import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { analyzeImage, translateText as translateTextUtil, detectSentiment } from '../utils/ai';

export const analyzeImageHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need body' })
      };
    }
    
    const body = JSON.parse(event.body);
    const { imageData, imageUrl } = body;
    
    if (!imageData && !imageUrl) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need image data or url' })
      };
    }
    
    // convert to bytes for rekognition
    let imageBytes: Buffer;
    if (imageUrl) {
      // @ts-ignore - node-fetch types are annoying
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imageUrl);
      imageBytes = Buffer.from(await response.arrayBuffer());
    } else {
      imageBytes = Buffer.from(imageData, 'base64');
    }
    
    const analysis = await analyzeImage(imageBytes);
    
    console.log('analyzed image, found:', analysis.labels.length, 'labels');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysis)
    };
  } catch (error: any) {
    console.error('Error analyzing image:', error);
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

export const translateText = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need body' })
      };
    }
    
    const body = JSON.parse(event.body);
    const { text, targetLanguage, sourceLanguage = 'auto' } = body;
    
    if (!text || !targetLanguage) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need text and target language' })
      };
    }
    
    const translated = await translateTextUtil(text, targetLanguage, sourceLanguage);
    
    // TODO: maybe cache translations so we don't keep translating the same stuff
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        originalText: text,
        translatedText: translated,
        targetLanguage
      })
    };
  } catch (error: any) {
    console.error('Error translating text:', error);
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

