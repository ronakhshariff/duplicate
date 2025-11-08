"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUrl = exports.uploadImage = void 0;
const s3_1 = require("../utils/s3");
const auth_1 = require("../utils/auth");
const uploadImage = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need body' })
            };
        }
        const body = JSON.parse(event.body);
        const { requestId, filename, contentType, imageData } = body;
        if (!filename || !contentType) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need filename and content type' })
            };
        }
        if (!imageData) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need image data' })
            };
        }
        const key = (0, s3_1.generateImageKey)(userId, requestId || 'temp', filename);
        const url = await (0, s3_1.uploadToS3)(key, Buffer.from(imageData, 'base64'), contentType);
        console.log('uploaded image:', key);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                key
            })
        };
    }
    catch (error) {
        console.error('Error uploading image:', error);
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
exports.uploadImage = uploadImage;
const getPresignedUrl = async (event) => {
    try {
        const userId = (0, auth_1.extractUserIdFromEvent)(event);
        const requestId = event.queryStringParameters?.requestId || 'temp';
        const filename = event.queryStringParameters?.filename;
        const contentType = event.queryStringParameters?.contentType || 'image/jpeg';
        if (!filename) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'need filename' })
            };
        }
        const key = (0, s3_1.generateImageKey)(userId, requestId, filename);
        const presignedUrl = await (0, s3_1.getPresignedUploadUrl)(key, contentType);
        // return the presigned url so frontend can upload directly
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                presignedUrl,
                key,
                url: `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${key}`
            })
        };
    }
    catch (error) {
        console.error('Error getting presigned URL:', error);
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
exports.getPresignedUrl = getPresignedUrl;
//# sourceMappingURL=storage.js.map