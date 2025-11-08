"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_NAME = exports.docClient = void 0;
exports.putItem = putItem;
exports.getItem = getItem;
exports.queryByCity = queryByCity;
exports.queryByStatus = queryByStatus;
exports.updateRequestStatus = updateRequestStatus;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.TABLE_NAME = process.env.TABLE_NAME || 'neighbourly-dev';
async function putItem(item) {
    await exports.docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: exports.TABLE_NAME,
        Item: item
    }));
}
async function getItem(PK, SK) {
    const result = await exports.docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: exports.TABLE_NAME,
        Key: { PK, SK }
    }));
    return result.Item || null; // return null instead of undefined
}
async function queryByCity(city, region) {
    const result = await exports.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: exports.TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
            ':pk': `${city}#${region}`,
            ':skPrefix': 'request#'
        }
    }));
    return result.Items;
}
async function queryByStatus(status) {
    // TODO: make sure GSI1 exists in dynamo
    const result = await exports.docClient.send(new lib_dynamodb_1.QueryCommand({
        TableName: exports.TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: {
            ':status': `status#${status}`
        }
    }));
    return (result.Items || []);
}
async function updateRequestStatus(requestId, city, region, status, acceptedBy) {
    await exports.docClient.send(new lib_dynamodb_1.UpdateCommand({
        TableName: exports.TABLE_NAME,
        Key: {
            PK: `${city}#${region}`,
            SK: `request#${requestId}`
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, acceptedBy = :acceptedBy',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
            ':acceptedBy': acceptedBy || null
        }
    }));
}
//# sourceMappingURL=dynamodb.js.map