# Authentication Flow for Frontend

How to handle Cognito authentication in the frontend.

## Getting a Token

### Option 1: Use Cognito SDK (Recommended)

```javascript
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-east-1_XXXXXXXXX',
  ClientId: 'your-client-id'
};
const userPool = new CognitoUserPool(poolData);

// Sign in
const authenticationDetails = new AuthenticationDetails({
  Username: 'user@example.com',
  Password: 'password123'
});

const cognitoUser = new CognitoUser({
  Username: 'user@example.com',
  Pool: userPool
});

cognitoUser.authenticateUser(authenticationDetails, {
  onSuccess: (result) => {
    const token = result.getIdToken().getJwtToken();
    // Save token and use in API calls
    localStorage.setItem('token', token);
  },
  onFailure: (err) => {
    console.error('Auth failed:', err);
  }
});
```

### Option 2: Use AWS Amplify (Easier)

```javascript
import { Auth } from 'aws-amplify';

// Configure
Auth.configure({
  userPoolId: 'us-east-1_XXXXXXXXX',
  userPoolWebClientId: 'your-client-id',
  region: 'us-east-1'
});

// Sign in
const user = await Auth.signIn('user@example.com', 'password');
const token = user.signInUserSession.idToken.jwtToken;
```

## Using the Token

Include in all API requests:
```javascript
fetch('https://api-url/dev/requests', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Token Refresh

Tokens expire after 1 hour (default). You need to refresh them:

```javascript
// With Cognito SDK
cognitoUser.getSession((err, session) => {
  if (err) {
    // Need to re-authenticate
  } else {
    const newToken = session.getIdToken().getJwtToken();
  }
});

// With Amplify
const session = await Auth.currentSession();
const newToken = session.getIdToken().getJwtToken();
```

## Sign Up Flow

```javascript
// Sign up
userPool.signUp('user@example.com', 'password123', [], null, (err, result) => {
  if (err) {
    console.error('Sign up failed:', err);
  } else {
    // User needs to confirm email
    console.log('User created:', result.user);
  }
});

// Confirm sign up
cognitoUser.confirmRegistration('123456', true, (err, result) => {
  if (err) {
    console.error('Confirmation failed:', err);
  } else {
    console.log('User confirmed');
  }
});
```

## Environment Variables for Frontend

You'll need:
- `COGNITO_USER_POOL_ID`
- `COGNITO_USER_POOL_CLIENT_ID`
- `API_BASE_URL` (your deployed API Gateway URL)

Set these in your frontend `.env` file.

