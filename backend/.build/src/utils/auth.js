"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = getUserFromToken;
exports.extractUserIdFromEvent = extractUserIdFromEvent;
exports.extractUserEmailFromEvent = extractUserEmailFromEvent;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: process.env.REGION || 'us-east-1'
});
async function getUserFromToken(token) {
    try {
        // cognito handles the token stuff for us, just grab the user info
        // TODO: this might not work the way i think, need to test
        const command = new client_cognito_identity_provider_1.AdminGetUserCommand({
            UserPoolId: process.env.USER_POOL_ID || '',
            Username: token
        });
        const response = await cognitoClient.send(command);
        return {
            userId: response.Username || '',
            email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || ''
        };
    }
    catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}
function extractUserIdFromEvent(event) {
    // get the user id from the auth token that cognito already verified
    // hack: try sub first, then username, then just return unknown
    return event.requestContext?.authorizer?.claims?.sub ||
        event.requestContext?.authorizer?.claims?.username ||
        'unknown';
}
function extractUserEmailFromEvent(event) {
    // sometimes email might not be there
    return event.requestContext?.authorizer?.claims?.email || '';
}
//# sourceMappingURL=auth.js.map