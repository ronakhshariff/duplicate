"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapData = exports.getStats = void 0;
const dynamodb_1 = require("../utils/dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const getStats = async (event) => {
    try {
        const city = event.queryStringParameters?.city;
        const region = event.queryStringParameters?.region;
        // scan all requests - might be slow with lots of data but works for now
        const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: dynamodb_1.TABLE_NAME,
            FilterExpression: 'begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':skPrefix': 'request#'
            }
        }));
        const requests = result.Items || [];
        // filter by city/region if provided
        let filteredRequests = requests;
        if (city && region) {
            filteredRequests = requests.filter((r) => r.PK === `${city}#${region}`);
        }
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours
        const stats = {
            totalRequests: filteredRequests.length,
            activeRequests: filteredRequests.filter((r) => r.status === 'open' || r.status === 'accepted' || r.status === 'in_progress').length,
            completedRequests: filteredRequests.filter((r) => r.status === 'completed').length,
            totalVolunteers: new Set(filteredRequests.map((r) => r.acceptedBy).filter(Boolean)).size,
            requestsByCategory: {},
            requestsByUrgency: {},
            requestsByStatus: {},
            recentActivity: filteredRequests.filter((r) => {
                const createdAt = new Date(r.createdAt);
                return createdAt >= oneDayAgo;
            }).length
        };
        // count by category
        filteredRequests.forEach((r) => {
            const category = r.category || 'general';
            stats.requestsByCategory[category] = (stats.requestsByCategory[category] || 0) + 1;
        });
        // count by urgency
        filteredRequests.forEach((r) => {
            const urgency = r.urgency || 'medium';
            stats.requestsByUrgency[urgency] = (stats.requestsByUrgency[urgency] || 0) + 1;
        });
        // count by status
        filteredRequests.forEach((r) => {
            const status = r.status || 'open';
            stats.requestsByStatus[status] = (stats.requestsByStatus[status] || 0) + 1;
        });
        console.log('stats calculated:', stats.totalRequests, 'requests');
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stats)
        };
    }
    catch (error) {
        console.error('Error getting stats:', error);
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
exports.getStats = getStats;
const getHeatmapData = async (event) => {
    try {
        const city = event.queryStringParameters?.city;
        const region = event.queryStringParameters?.region;
        // grab all the requests (same scan as stats, could optimize later)
        const result = await dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: dynamodb_1.TABLE_NAME,
            FilterExpression: 'begins_with(SK, :skPrefix)',
            ExpressionAttributeValues: {
                ':skPrefix': 'request#'
            }
        }));
        let requests = result.Items || [];
        if (city && region) {
            requests = requests.filter((r) => r.PK === `${city}#${region}`);
        }
        // cluster nearby requests together
        const clusters = [];
        const clusterRadius = 0.01; // about 1km, might need to adjust
        requests.forEach((request) => {
            if (!request.location)
                return;
            const lat = request.location.latitude;
            const lon = request.location.longitude;
            let foundCluster = false;
            for (const cluster of clusters) {
                const distance = Math.sqrt(Math.pow(cluster.latitude - lat, 2) + Math.pow(cluster.longitude - lon, 2));
                if (distance < clusterRadius) {
                    cluster.count++;
                    cluster.requests.push(request);
                    foundCluster = true;
                    break;
                }
            }
            if (!foundCluster) {
                clusters.push({
                    latitude: lat,
                    longitude: lon,
                    count: 1,
                    requests: [request]
                });
            }
        });
        const heatmapPoints = clusters.map(cluster => {
            if (cluster.requests.length === 1) {
                return {
                    latitude: cluster.latitude,
                    longitude: cluster.longitude,
                    intensity: 1,
                    requestCount: 1
                };
            }
            const avgLat = cluster.requests.reduce((sum, r) => sum + r.location.latitude, 0) / cluster.requests.length;
            const avgLon = cluster.requests.reduce((sum, r) => sum + r.location.longitude, 0) / cluster.requests.length;
            return {
                latitude: avgLat,
                longitude: avgLon,
                intensity: Math.min(cluster.count / 10, 1),
                requestCount: cluster.count
            };
        });
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ heatmap: heatmapPoints })
        };
    }
    catch (error) {
        console.error('Error getting heatmap data:', error);
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
exports.getHeatmapData = getHeatmapData;
//# sourceMappingURL=admin.js.map