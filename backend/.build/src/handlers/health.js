"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const healthCheck = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'ok',
            message: 'Neighbourly API is running',
            baseUrl: event.requestContext?.path?.replace('/', '') || '/dev',
            endpoints: {
                requests: '/requests',
                users: '/users/me',
                notifications: '/notifications',
                admin: '/admin/stats',
                weather: '/weather/alerts'
            }
        })
    };
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=health.js.map