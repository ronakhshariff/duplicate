"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIoTCommand = exports.processIoTEvent = void 0;
// iot integration for automated sensor-triggered requests
// e.g. flood sensor detects water -> automatically creates emergency request
const client_iot_data_plane_1 = require("@aws-sdk/client-iot-data-plane");
const dynamodb_1 = require("../utils/dynamodb");
const location_1 = require("../utils/location");
const ai_1 = require("../utils/ai");
const weather_1 = require("../utils/weather");
const iotClient = new client_iot_data_plane_1.IoTDataPlaneClient({ region: process.env.REGION || 'us-east-1' });
const IOT_TOPIC = process.env.IOT_TOPIC || 'neighbourly/sensors';
// handles IoT sensor data and automatically creates requests
// e.g. flood sensor detects water -> creates emergency request
const processIoTEvent = async (event) => {
    try {
        const sensorData = event.detail;
        const { sensorType, location, value, threshold, timestamp } = sensorData;
        console.log('processing iot event:', sensorType, 'at', location);
        // only create request if sensor value exceeds threshold (e.g. flood detected)
        if (value < threshold) {
            console.log('sensor value below threshold, no action needed');
            return;
        }
        // determine what kind of request to create based on sensor type
        let title = '';
        let description = '';
        let category = 'Safety';
        let urgency = 'high';
        switch (sensorType) {
            case 'flood':
                title = `Flood detected on ${location.address || 'street'}`;
                description = `Flood sensor detected water level of ${value}cm (threshold: ${threshold}cm). Volunteers needed to help divert traffic and assist residents.`;
                category = 'Safety';
                urgency = 'emergency';
                break;
            case 'air_quality':
                title = `Poor air quality detected in ${location.areaName || 'area'}`;
                description = `Air quality sensor detected AQI of ${value} (threshold: ${threshold}). Vulnerable residents may need assistance.`;
                category = 'Medical';
                urgency = value > threshold * 1.5 ? 'emergency' : 'high';
                break;
            case 'temperature':
                if (value > 35) {
                    title = `Extreme heat detected in ${location.areaName || 'area'}`;
                    description = `Temperature sensor detected ${value}°C. Check on elderly neighbors and vulnerable residents.`;
                    category = 'Medical';
                    urgency = 'high';
                }
                else if (value < -10) {
                    title = `Extreme cold detected in ${location.areaName || 'area'}`;
                    description = `Temperature sensor detected ${value}°C. Ensure vulnerable residents have heating.`;
                    category = 'Medical';
                    urgency = 'high';
                }
                else {
                    return; // normal temperature, no action
                }
                break;
            default:
                title = `Sensor alert: ${sensorType} in ${location.areaName || 'area'}`;
                description = `${sensorType} sensor detected value of ${value} (threshold: ${threshold}).`;
                category = 'Safety';
                urgency = 'medium';
        }
        // get area name from coordinates
        const areaName = await (0, location_1.reverseGeocode)(location.latitude, location.longitude);
        // use AI to categorize and detect priority (though we already set it above)
        const fullText = `${title} ${description}`;
        const catResult = await (0, ai_1.autoCategorizeRequest)(fullText);
        const priorityResult = await (0, ai_1.detectPriority)(fullText);
        const city = location.city || 'unknown';
        const region = location.region || 'unknown';
        const requestId = `iot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const PK = `${city}#${region}`;
        const SK = `request#${requestId}`;
        const now = new Date().toISOString();
        // get weather alerts for context
        const weatherAlerts = await (0, weather_1.getWeatherAlerts)(location.latitude, location.longitude);
        const requestItem = {
            PK,
            SK,
            GSI1PK: `status#open`,
            GSI1SK: now,
            requestId,
            userId: 'system', // system-generated request
            title,
            description,
            category: catResult.category || category,
            status: 'open',
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || areaName || 'Sensor location',
                areaName: areaName || undefined
            },
            images: [],
            urgency: priorityResult.urgency || urgency,
            aiLabels: [],
            createdAt: now,
            updatedAt: now
        };
        await (0, dynamodb_1.putItem)(requestItem);
        console.log('created iot-triggered request:', requestId);
        // publish to iot topic so other services can react
        try {
            await iotClient.send(new client_iot_data_plane_1.PublishCommand({
                topic: IOT_TOPIC,
                payload: Buffer.from(JSON.stringify({
                    requestId,
                    sensorType,
                    location,
                    value,
                    timestamp: now
                }))
            }));
        }
        catch (error) {
            console.error('error publishing to iot topic:', error);
            // don't fail if iot publish fails
        }
    }
    catch (error) {
        console.error('error processing iot event:', error);
        throw error;
    }
};
exports.processIoTEvent = processIoTEvent;
// handles manual iot commands (for testing or manual triggers)
const handleIoTCommand = async (event) => {
    // similar to processIoTEvent but triggered manually
    // could be used for testing or admin-triggered sensor alerts
    console.log('iot command received:', event);
    // implementation similar to processIoTEvent
};
exports.handleIoTCommand = handleIoTCommand;
//# sourceMappingURL=iot.js.map