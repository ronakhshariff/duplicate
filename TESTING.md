# Testing Guide - Frontend + Backend Integration

## ✅ Quick Test

### 1. Test Backend is Running

```bash
# In one terminal, start the backend
cd backend
npm run dev
```

You should see:
```
Serverless Offline listening on http://localhost:3000
```

### 2. Test Backend Health (No Auth Needed)

```bash
curl http://localhost:3000/dev/
```

Expected response:
```json
{
  "status": "ok",
  "message": "Burrowly API is running",
  "baseUrl": "/dev",
  "endpoints": {
    "requests": "/requests",
    "users": "/users/me",
    "notifications": "/notifications",
    "admin": "/admin/stats",
    "weather": "/weather/alerts"
  }
}
```

### 3. Test Frontend Can Connect

```bash
# Run the test script
node test-connection.js
```

This will:
- ✅ Test health endpoint (should work)
- ✅ Test API connection (will fail without auth, but that's expected)

## 🔗 Connecting Frontend to Backend

### Step 1: Configure API Base URL

In your frontend code, you need to set the API base URL. Create a config file:

**`src/config.js`**:
```javascript
export const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev'
  : 'http://localhost:3000/dev';
```

### Step 2: Make API Calls

Example in your React component:

```javascript
import { API_BASE } from './config';

// Health check (no auth needed)
const checkBackend = async () => {
  const response = await fetch(`${API_BASE}/`);
  const data = await response.json();
  console.log('Backend status:', data.status);
};

// Get requests (needs auth)
const getRequests = async (token) => {
  const response = await fetch(`${API_BASE}/requests?city=toronto&region=ontario`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Step 3: Add CORS Proxy (if needed)

If you get CORS errors, you can:
1. Use Vite proxy (recommended for dev)
2. Or configure CORS in serverless.yml (already done)

**`vite.config.js`** (add this):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/dev': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

## 🧪 Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend can reach backend (test with `test-connection.js`)
- [ ] Frontend can make API calls (with proper auth)
- [ ] CORS is working (no browser errors)
- [ ] API responses are in expected format

## 📚 Next Steps

1. **Set up Cognito** - You'll need this for auth
   - See `backend/docs/AUTH_FLOW.md` for details
   
2. **Read API docs** - Check `backend/docs/API.md` for all endpoints

3. **Test endpoints** - Use Postman or curl with auth tokens

4. **Integrate in frontend** - Start with health check, then add auth, then add real features

## 🐛 Troubleshooting

**Backend not responding?**
- Make sure `npm run dev` is running in `backend/` folder
- Check port 3000 isn't already in use

**CORS errors?**
- Add Vite proxy (see above)
- Or check `serverless.yml` has `cors: true` on endpoints

**401 Unauthorized?**
- This is expected! You need Cognito tokens
- See `backend/docs/AUTH_FLOW.md` for how to get tokens

**502 Bad Gateway?**
- Serverless offline might need a restart
- Check backend terminal for errors

