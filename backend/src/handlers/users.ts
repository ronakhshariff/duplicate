import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getItem, putItem, UserItem } from '../utils/dynamodb';
import { extractUserIdFromEvent, extractUserEmailFromEvent } from '../utils/auth';

export const getCurrentUser = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = extractUserIdFromEvent(event);
    const userEmail = extractUserEmailFromEvent(event);
    
    const city = event.queryStringParameters?.city || 'unknown';
    const region = event.queryStringParameters?.region || 'unknown';
    const PK = `${city}#${region}`;
    const SK = `user#${userId}`;
    
    let user = await getItem(PK, SK);
    
    // if user doesn't exist yet, create them
    if (!user) {
      console.log('creating new user:', userId);
      const now = new Date().toISOString();
      const newUser: UserItem = {
        PK,
        SK,
        userId,
        email: userEmail,
        name: userEmail.split('@')[0], // hack: just use email prefix as name for now
        city,
        region,
        createdAt: now,
        updatedAt: now,
        totalHelps: 0,
        rating: 0
      };
      
      await putItem(newUser);
      user = newUser;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    };
  } catch (error: any) {
    console.error('Error getting user:', error);
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

export const updateCurrentUser = async (
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
    const { name, city, region, phone, skillsOffered, assistanceNeeded, bio, preferredLanguage } = body;
    
    // TODO: validate this stuff better
    
    const currentCity = event.queryStringParameters?.city || city || 'unknown';
    const currentRegion = event.queryStringParameters?.region || region || 'unknown';
    const PK = `${currentCity}#${currentRegion}`;
    const SK = `user#${userId}`;
    
    const existingUser = await getItem(PK, SK);
    
    if (!existingUser) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'user not found' })
      };
    }
    
    const updatedUser: UserItem = {
      ...existingUser,
      name: name || existingUser.name,
      city: city || existingUser.city,
      region: region || existingUser.region,
      phone: phone !== undefined ? phone : existingUser.phone,
      updatedAt: new Date().toISOString(),
      skillsOffered: skillsOffered || existingUser.skillsOffered || [],
      assistanceNeeded: assistanceNeeded || existingUser.assistanceNeeded || [],
      bio: bio !== undefined ? bio : existingUser.bio,
      preferredLanguage: preferredLanguage || existingUser.preferredLanguage || 'en'
    };
    
    await putItem(updatedUser);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedUser)
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
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

