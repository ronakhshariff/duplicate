"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatus = exports.acceptRequest = exports.getRequest = exports.getRequests = exports.createRequest = void 0;
const dynamodb_1 = require("../utils/dynamodb");
const auth_1 = require("../utils/auth");
const ai_1 = require("../utils/ai");
const weather_1 = require("../utils/weather");
const distance_1 = require("../utils/distance");
const notifications_1 = require("../utils/notifications");
const location_1 = require("../utils/location");
const monitoring_1 = require("../utils/monitoring");
const createRequest = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        // TODO: use userEmail somewhere maybe?
        const userEmail = (0, auth_1.extractUserEmailFromEvent)(event);
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need body' })
            };
        }
        const body = JSON.parse(event.body);
        const { title, description, category, location, images, urgency } = body;
        // basic validation
        if (!title || !description || !location) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'missing required fields' })
            };
        }
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const city = location.city || 'unknown';
        const region = location.region || 'unknown';
        const PK = `${city}#${region}`;
        const SK = `request#${requestId}`;
        const now = new Date().toISOString();
        console.log('creating request for user:', userId);
        // figure out what category this is based on the text
        const fullText = `${title} ${description}`;
        const catResult = await (0, ai_1.autoCategorizeRequest)(fullText);
        const finalCategory = category || catResult.category;
        // guess how urgent it is
        const priorityResult = await (0, ai_1.detectPriority)(fullText);
        const finalUrgency = urgency || priorityResult.urgency;
        let aiLabels = [];
        let processedImages = images || [];
        // TODO: actually process images with rekognition later
        const weatherAlerts = await (0, weather_1.getWeatherAlerts)(location.latitude, location.longitude);
        // get human-readable area name from coordinates (e.g. "Downtown, Toronto")
        const areaName = await (0, location_1.reverseGeocode)(location.latitude, location.longitude);
        const requestItem = {
            PK,
            SK,
            GSI1PK: `status#open`,
            GSI1SK: now,
            requestId,
            userId,
            title,
            description,
            category: finalCategory,
            status: 'open',
            location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address || areaName || 'Unknown location',
                areaName: areaName || undefined // human-readable area name from location service
            },
            images: processedImages,
            urgency: finalUrgency,
            aiLabels,
            createdAt: now,
            updatedAt: now
        };
        await (0, dynamodb_1.putItem)(requestItem);
        // track metrics for monitoring
        await (0, monitoring_1.trackRequestCreated)(finalCategory, finalUrgency);
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...requestItem,
                weatherAlerts,
                aiCategory: catResult.category,
                aiPriority: {
                    urgency: priorityResult.urgency,
                    reason: priorityResult.reason
                }
            })
        };
    }
    catch (error) {
        console.error('Error creating request:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error?.message || 'failed to create' })
        };
    }
};
exports.createRequest = createRequest;
const getRequests = async (event) => {
    try {
        const city = event.queryStringParameters?.city || 'unknown';
        const region = event.queryStringParameters?.region || 'unknown';
        const status = event.queryStringParameters?.status;
        const category = event.queryStringParameters?.category;
        const urgency = event.queryStringParameters?.urgency;
        const search = event.queryStringParameters?.search;
        const preferredLanguage = event.queryStringParameters?.preferredLanguage || 'en';
        const userLat = parseFloat(event.queryStringParameters?.latitude || '0');
        const userLon = parseFloat(event.queryStringParameters?.longitude || '0');
        const radiusKm = parseFloat(event.queryStringParameters?.radius || '0');
        // pagination
        const limit = parseInt(event.queryStringParameters?.limit || '50');
        const offset = parseInt(event.queryStringParameters?.offset || '0');
        let requests;
        // hack: query by status if provided, otherwise by city
        if (status) {
            requests = await (0, dynamodb_1.queryByStatus)(status);
        }
        else {
            requests = await (0, dynamodb_1.queryByCity)(city, region);
        }
        // filter by category if needed
        if (category) {
            requests = requests.filter(r => r.category.toLowerCase() === category.toLowerCase());
        }
        if (urgency) {
            requests = requests.filter(r => r.urgency === urgency);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            requests = requests.filter(r => r.title.toLowerCase().includes(searchLower) ||
                r.description.toLowerCase().includes(searchLower));
        }
        let requestsWithDistance = requests;
        if (userLat !== 0 && userLon !== 0) {
            if (radiusKm > 0) {
                requestsWithDistance = (0, distance_1.filterByRadius)(requests, userLat, userLon, radiusKm);
            }
            else {
                requestsWithDistance = (0, distance_1.sortByDistance)(requests, userLat, userLon);
            }
        }
        if (preferredLanguage !== 'en') {
            requestsWithDistance = await Promise.all(requestsWithDistance.map(async (req) => {
                if (req.translatedDescription && req.translatedDescription[preferredLanguage]) {
                    return {
                        ...req,
                        description: req.translatedDescription[preferredLanguage],
                        originalDescription: req.description
                    };
                }
                try {
                    const translated = await (0, ai_1.translateText)(req.description, preferredLanguage, 'auto');
                    if (!req.translatedDescription) {
                        req.translatedDescription = {};
                    }
                    req.translatedDescription[preferredLanguage] = translated;
                    (0, dynamodb_1.putItem)(req).catch(err => console.error('Error saving translation:', err));
                    return {
                        ...req,
                        description: translated,
                        originalDescription: req.description
                    };
                }
                catch (error) {
                    console.error('Translation error:', error);
                    return req;
                }
            }));
        }
        // pagination
        const total = requestsWithDistance.length;
        const paginated = requestsWithDistance.slice(offset, offset + limit);
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: paginated,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            })
        };
    }
    catch (error) {
        console.error('Error getting requests:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.getRequests = getRequests;
const getRequest = async (event) => {
    try {
        const requestId = event.pathParameters?.requestId;
        const city = event.queryStringParameters?.city || 'unknown';
        const region = event.queryStringParameters?.region || 'unknown';
        if (!requestId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need request id' })
            };
        }
        const req = await (0, dynamodb_1.getItem)(`${city}#${region}`, `request#${requestId}`);
        if (!req) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'not found' })
            };
        }
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        };
    }
    catch (error) {
        console.error('Error getting request:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error?.message || 'error' })
        };
    }
};
exports.getRequest = getRequest;
const acceptRequest = async (event) => {
    try {
        const requestId = event.pathParameters?.requestId;
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const city = event.queryStringParameters?.city || 'unknown';
        const region = event.queryStringParameters?.region || 'unknown';
        if (!requestId) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need request id' })
            };
        }
        const req = await (0, dynamodb_1.getItem)(`${city}#${region}`, `request#${requestId}`);
        if (!req) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'not found' })
            };
        }
        if (req.status !== 'open') {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'already taken or closed' })
            };
        }
        await (0, dynamodb_1.updateRequestStatus)(requestId, city, region, 'accepted', userId);
        // notify the person who made the request
        await (0, notifications_1.createNotification)(req.userId, 'request_accepted', 'Your request has been accepted!', `${userId} has accepted your request: "${req.title}"`, requestId, { acceptedBy: userId });
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'accepted',
                requestId,
                acceptedBy: userId
            })
        };
    }
    catch (error) {
        console.error('Error accepting request:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.acceptRequest = acceptRequest;
const updateRequestStatus = async (event) => {
    try {
        const requestId = event.pathParameters?.requestId;
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const city = event.queryStringParameters?.city || 'unknown';
        const region = event.queryStringParameters?.region || 'unknown';
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need body' })
            };
        }
        const body = JSON.parse(event.body);
        const { status } = body;
        if (!requestId || !status) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need id and status' })
            };
        }
        const req = await (0, dynamodb_1.getItem)(`${city}#${region}`, `request#${requestId}`);
        if (!req) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'not found' })
            };
        }
        // check if user can update this
        if (req.userId !== userId && req.acceptedBy !== userId) {
            return {
                statusCode: 403,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'cant update this' })
            };
        }
        await (0, dynamodb_1.updateRequestStatus)(requestId, city, region, status, req.acceptedBy);
        // track completion metrics
        if (status === 'completed') {
            const createdAt = new Date(req.createdAt);
            const completedAt = new Date();
            const durationSeconds = (completedAt.getTime() - createdAt.getTime()) / 1000;
            await (0, monitoring_1.trackRequestCompleted)(durationSeconds);
        }
        // send notifications based on status
        if (status === 'completed') {
            await (0, notifications_1.createNotification)(req.userId, 'request_completed', 'Request completed!', `Your request "${req.title}" has been marked as completed.`, requestId);
            if (req.acceptedBy) {
                await (0, notifications_1.createNotification)(req.acceptedBy, 'request_completed', 'Request completed!', `The request "${req.title}" you helped with has been completed.`, requestId);
            }
        }
        else if (status === 'cancelled') {
            if (req.acceptedBy) {
                await (0, notifications_1.createNotification)(req.acceptedBy, 'request_cancelled', 'Request cancelled', `The request "${req.title}" has been cancelled.`, requestId);
            }
        }
        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'updated',
                requestId,
                status
            })
        };
    }
    catch (error) {
        console.error('Error updating request status:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error?.message || 'failed' })
        };
    }
};
exports.updateRequestStatus = updateRequestStatus;
//# sourceMappingURL=requests.js.map