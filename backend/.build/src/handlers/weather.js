"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherAlerts = void 0;
const weather_1 = require("../utils/weather");
const getWeatherAlerts = async (event) => {
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
        const alerts = await (0, weather_1.getWeatherAlerts)(latitude, longitude);
        console.log('got weather alerts:', alerts.length);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ alerts })
        };
    }
    catch (error) {
        console.error('Error getting weather alerts:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error?.message || 'weather api failed' })
        };
    }
};
exports.getWeatherAlerts = getWeatherAlerts;
//# sourceMappingURL=weather.js.map