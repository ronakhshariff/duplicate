"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPlacesHandler = exports.reverseGeocodeHandler = exports.geocode = void 0;
const location_1 = require("../utils/location");
// geocodes an address to coordinates
const geocode = async (event) => {
    try {
        const address = event.queryStringParameters?.address;
        if (!address) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need address' })
            };
        }
        const result = await (0, location_1.geocodeAddress)(address);
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
    }
    catch (error) {
        console.error('geocode error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error?.message || 'geocoding failed' })
        };
    }
};
exports.geocode = geocode;
// reverse geocodes coordinates to address/area name
const reverseGeocodeHandler = async (event) => {
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
        const areaName = await (0, location_1.reverseGeocode)(latitude, longitude);
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
    }
    catch (error) {
        console.error('reverse geocode error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error?.message || 'reverse geocoding failed' })
        };
    }
};
exports.reverseGeocodeHandler = reverseGeocodeHandler;
// searches for places (hospitals, stores, etc)
const searchPlacesHandler = async (event) => {
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
        const places = await (0, location_1.searchPlaces)(query, latitude !== 0 ? latitude : undefined, longitude !== 0 ? longitude : undefined);
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ places })
        };
    }
    catch (error) {
        console.error('place search error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error?.message || 'search failed' })
        };
    }
};
exports.searchPlacesHandler = searchPlacesHandler;
//# sourceMappingURL=location.js.map