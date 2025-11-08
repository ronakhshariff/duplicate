// calculates how far apart two points are on earth (in km)
// stole this formula from stackoverflow lol (haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // round to 1 decimal
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// sorts requests by how close they are to the user
export function sortByDistance<T extends { location: { latitude: number; longitude: number } }>(
  requests: T[],
  userLat: number,
  userLon: number
): Array<T & { distance: number }> {
  return requests
    .map(request => ({
      ...request,
      distance: calculateDistance(
        userLat,
        userLon,
        request.location.latitude,
        request.location.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

// only shows requests within a certain distance (radius in km)
export function filterByRadius<T extends { location: { latitude: number; longitude: number } }>(
  requests: T[],
  userLat: number,
  userLon: number,
  radiusKm: number
): Array<T & { distance: number }> {
  return requests
    .map(request => ({
      ...request,
      distance: calculateDistance(
        userLat,
        userLon,
        request.location.latitude,
        request.location.longitude
      )
    }))
    .filter(request => request.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

