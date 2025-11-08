# Frontend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Cognito credentials (when you have them):
```
VITE_API_BASE=http://localhost:3000/dev
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_AWS_REGION=us-east-1
```

### 3. Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (different port from backend)

### 4. Start Backend (in another terminal)

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000/dev`

## Testing the Connection

### Option 1: Use the Test Component

I've created a `BackendTest` component. Add it to your `App.jsx`:

```jsx
import BackendTest from './components/BackendTest';

// In your App component:
<BackendTest />
```

This will let you test the health check endpoint.

### Option 2: Test in Browser Console

Open browser console and run:

```javascript
import { api } from './src/api';

// Test health check (no auth needed)
api.healthCheck().then(console.log);

// Test getting requests (needs auth)
api.getRequests({ city: 'toronto', region: 'ontario' }).then(console.log).catch(console.error);
```

## Using the API

### Basic Usage

```javascript
import { api } from './api';

// Health check (no auth)
const health = await api.healthCheck();
console.log(health);

// Get requests (needs auth token)
const requests = await api.getRequests({ 
  city: 'toronto', 
  region: 'ontario',
  status: 'open'
});

// Create a request (needs auth)
const newRequest = await api.createRequest({
  title: 'Need help moving',
  description: 'Moving this weekend, need help with heavy furniture',
  category: 'Moving',
  location: {
    latitude: 43.6532,
    longitude: -79.3832,
    city: 'toronto',
    region: 'ontario'
  },
  urgency: 'medium'
});
```

### With Authentication

First, set up Cognito (see below), then:

```javascript
import { auth } from './auth';
import { api } from './api';

// Sign in
const token = await auth.signIn('user@example.com', 'password');
auth.setTokens(token);

// Now API calls will include the token automatically
const requests = await api.getRequests({ city: 'toronto' });
```

## Setting Up Cognito Auth

### Step 1: Install AWS Amplify (Recommended)

```bash
npm install aws-amplify @aws-amplify/ui-react
```

### Step 2: Update `src/auth.js`

Uncomment the Amplify implementation and configure it with your Cognito details.

### Step 3: Get Cognito Credentials

1. Go to AWS Console → Cognito
2. Create a User Pool (or use existing)
3. Get the User Pool ID and App Client ID
4. Add them to your `.env` file

### Step 4: Use Auth in Your App

```javascript
import { auth } from './auth';

// Sign up
await auth.signUp('user@example.com', 'password123', 'John Doe');

// Sign in
const token = await auth.signIn('user@example.com', 'password123');
auth.setTokens(token);

// Check if logged in
if (auth.isAuthenticated()) {
  console.log('User is logged in!');
}

// Sign out
auth.signOut();
```

## File Structure

```
src/
├── config.js          # API base URL and Cognito config
├── api.js             # API helper functions
├── auth.js            # Authentication helpers
├── components/
│   └── BackendTest.jsx # Test component
└── App.jsx            # Your main app
```

## Troubleshooting

**CORS Errors?**
- Vite proxy should handle this automatically
- Make sure backend is running on port 3000
- Check `vite.config.js` has the proxy configured

**401 Unauthorized?**
- You need to set up Cognito auth
- Or the token expired (try signing in again)

**Connection Refused?**
- Make sure backend is running: `cd backend && npm run dev`
- Check backend is on port 3000

**Port Already in Use?**
- Frontend uses port 5173 (changed from 3000)
- Backend uses port 3000
- If 5173 is taken, change it in `vite.config.js`

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test health check endpoint
3. ⏳ Set up Cognito (get credentials from AWS)
4. ⏳ Implement login/signup UI
5. ⏳ Connect real features to API

See `backend/docs/API.md` for all available endpoints!

