export declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function sortByDistance<T extends {
    location: {
        latitude: number;
        longitude: number;
    };
}>(requests: T[], userLat: number, userLon: number): Array<T & {
    distance: number;
}>;
export declare function filterByRadius<T extends {
    location: {
        latitude: number;
        longitude: number;
    };
}>(requests: T[], userLat: number, userLon: number, radiusKm: number): Array<T & {
    distance: number;
}>;
//# sourceMappingURL=distance.d.ts.map