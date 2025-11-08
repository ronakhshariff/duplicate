export declare function geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
    areaName?: string;
} | null>;
export declare function reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
export declare function getMapTilesUrl(style?: 'Esri' | 'Here' | 'Grab'): string;
export declare function searchPlaces(query: string, latitude?: number, longitude?: number): Promise<any[]>;
//# sourceMappingURL=location.d.ts.map