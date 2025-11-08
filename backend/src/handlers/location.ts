import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { geocodeAddress, reverseGeocode, searchPlaces } from '../utils/location';

// geocodes an address to coordinates
export const geocode = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const address = event.queryStringParameters?.address;

    if (!address) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need address' })
      };
    }

    const result = await geocodeAddress(address);

    if (!result) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'address not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (error: any) {
    console.error('geocode error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'geocoding failed' })
    };
  }
};

// reverse geocodes coordinates to address/area name
export const reverseGeocodeHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const latitude = parseFloat(event.queryStringParameters?.latitude || '0');
    const longitude = parseFloat(event.queryStringParameters?.longitude || '0');

    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need valid lat and lon' })
      };
    }

    const areaName = await reverseGeocode(latitude, longitude);

    if (!areaName) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'location not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaName, latitude, longitude })
    };
  } catch (error: any) {
    console.error('reverse geocode error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'reverse geocoding failed' })
    };
  }
};

// searches for places (hospitals, stores, etc)
export const searchPlacesHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters?.query;
    const latitude = parseFloat(event.queryStringParameters?.latitude || '0');
    const longitude = parseFloat(event.queryStringParameters?.longitude || '0');

    if (!query) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'need search query' })
      };
    }

    const places = await searchPlaces(
      query,
      latitude !== 0 ? latitude : undefined,
      longitude !== 0 ? longitude : undefined
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ places })
    };
  } catch (error: any) {
    console.error('place search error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error?.message || 'search failed' })
    };
  }
};

