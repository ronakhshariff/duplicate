"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = uploadToS3;
exports.getPresignedUploadUrl = getPresignedUploadUrl;
exports.deleteFromS3 = deleteFromS3;
exports.generateImageKey = generateImageKey;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({ region: process.env.REGION || 'us-east-1' });
const BUCKET_NAME = process.env.S3_BUCKET || 'neighbourly-uploads-dev';
async function uploadToS3(key, body, contentType) {
    await s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read' // so anyone can view the images (might want to change this later)
    }));
    // return the public url
    return `https://${BUCKET_NAME}.s3.${process.env.REGION || 'us-east-1'}.amazonaws.com/${key}`;
}
async function getPresignedUploadUrl(key, contentType) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read'
    });
    // url expires in an hour, should be enough time to upload
    return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
}
async function deleteFromS3(key) {
    await s3Client.send(new client_s3_1.DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    }));
}
function generateImageKey(userId, requestId, filename) {
    const timestamp = Date.now();
    const extension = filename.split('.').pop() || 'jpg'; // default to jpg if no extension
    return `requests/${requestId}/${userId}-${timestamp}.${extension}`;
}
//# sourceMappingURL=s3.js.map