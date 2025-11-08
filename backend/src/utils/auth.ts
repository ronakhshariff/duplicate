import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.REGION || 'us-east-1' 
});

export async function getUserFromToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    // cognito handles the token stuff for us, just grab the user info
    // TODO: this might not work the way i think, need to test
    const command = new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID || '',
      Username: token
    });
    
    const response = await cognitoClient.send(command);
    
    return {
      userId: response.Username || '',
      email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || ''
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function extractUserIdFromEvent(event: any): string {
  // get the user id from the auth token that cognito already verified
  // hack: try sub first, then username, then just return unknown
  return event.requestContext?.authorizer?.claims?.sub || 
         event.requestContext?.authorizer?.claims?.username || 
         'unknown';
}

export function extractUserEmailFromEvent(event: any): string {
  // sometimes email might not be there
  return event.requestContext?.authorizer?.claims?.email || '';
}

