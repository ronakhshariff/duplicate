// using amazon location service instead of google maps - saves money and keeps everything on aws
import { LocationClient, SearchPlaceIndexForTextCommand, SearchPlaceIndexForPositionCommand } from '@aws-sdk/client-location';

const locationClient = new LocationClient({ region: process.env.REGION || 'us-east-1' });
const PLACE_INDEX_NAME = process.env.PLACE_INDEX_NAME || '';

// converts an address to coordinates (geocoding)
// e.g. "123 Main St, Toronto" -> { lat: 43.6532, lon: -79.3832 }
// uses esri data source which is free tier
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; areaName?: string } | null> {
  if (!PLACE_INDEX_NAME) {
    console.log('no place index configured, skipping geocoding');
    return null;
  }

  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: PLACE_INDEX_NAME,
      Text: address,
      MaxResults: 1
    });

    const response = await locationClient.send(command);
    const result = response.Results?.[0];

    if (!result?.Place?.Geometry?.Point) {
      return null;
    }

    const [longitude, latitude] = result.Place.Geometry.Point;
    const areaName = result.Place.Label; // e.g. "Downtown, Toronto"

    return {
      latitude,
      longitude,
      areaName
    };
  } catch (error) {
    console.error('geocoding error:', error);
    return null;
  }
}

// converts coordinates to a human-readable address (reverse geocoding)
// e.g. { lat: 43.6532, lon: -79.3832 } -> "Downtown, Toronto"
// this is what we use when creating requests to show area names
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  if (!PLACE_INDEX_NAME) {
    return null;
  }

  try {
    const command = new SearchPlaceIndexForPositionCommand({
      IndexName: PLACE_INDEX_NAME,
      Position: [longitude, latitude], // location service uses [lon, lat] order
      MaxResults: 1
    });

    const response = await locationClient.send(command);
    const result = response.Results?.[0];

    if (!result?.Place?.Label) {
      return null;
    }

    // return human-readable area name like "Downtown, Toronto" or "123 Main St, Toronto"
    return result.Place.Label;
  } catch (error) {
    console.error('reverse geocoding error:', error);
    return null;
  }
}

// gets map tiles url for displaying maps
// location service provides map tiles that we can use instead of google maps
// TODO: frontend can use this to display maps with location service tiles
export function getMapTilesUrl(style: 'Esri' | 'Here' | 'Grab' = 'Esri'): string {
  // location service map tiles endpoint
  const baseUrl = `https://maps.geo.${process.env.REGION || 'us-east-1'}.amazonaws.com/maps/v0/maps`;
  return `${baseUrl}/${style}/style-descriptor`;
}

// searches for places (like "coffee shop near me" or "hospital")
export async function searchPlaces(query: string, latitude?: number, longitude?: number): Promise<any[]> {
  if (!PLACE_INDEX_NAME) {
    return [];
  }

  try {
    const command = new SearchPlaceIndexForTextCommand({
      IndexName: PLACE_INDEX_NAME,
      Text: query,
      MaxResults: 10,
      ...(latitude && longitude && {
        BiasPosition: [longitude, latitude] // bias results towards user location
      })
    });

    const response = await locationClient.send(command);
    return (response.Results || []).map((result: any) => ({
      placeId: result.Place?.PlaceId,
      label: result.Place?.Label,
      address: result.Place?.Address,
      geometry: result.Place?.Geometry,
      distance: result.Distance
    }));
  } catch (error) {
    console.error('place search error:', error);
    return [];
  }
}

