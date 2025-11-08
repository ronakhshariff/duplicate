// API configuration
// change this to your deployed API URL when you deploy to AWS
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/dev';

// Cognito configuration (you'll need to set these up)
export const COGNITO_CONFIG = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1'
};

