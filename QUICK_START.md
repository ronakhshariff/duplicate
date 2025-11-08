# Quick Start - Frontend + Backend Integration

## ✅ What I've Done

1. ✅ Added `BackendTest` component to your App.jsx
2. ✅ Created API helper functions (`src/api.js`)
3. ✅ Created config file (`src/config.js`)
4. ✅ Updated Vite config (port 5173, proxy setup)
5. ✅ Created auth helpers (`src/auth.js`)

## 🚀 How to Run

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3000/dev`

### Terminal 2: Start Frontend
```bash
npm install  # if you haven't already
npm run dev
```
Frontend runs on: `http://localhost:5173`

## 🧪 Test It

1. Open `http://localhost:5173` in your browser
2. Scroll down to see the "Backend Connection Test" section
3. Click "Test Health Check" - should show ✅ Success!
4. Click "Test Get Requests" - will show error (needs auth, that's expected)

## 📝 What You'll See

The test component will appear at the bottom of your page (before the footer). It shows:
- ✅ Health check works (no auth needed)
- ⚠️ Get requests fails (needs Cognito auth - expected)

## 🔐 Next Steps (When Ready)

To get full functionality, you'll need:

1. **Cognito User Pool ID** - from AWS Console
2. **Cognito Client ID** - from AWS Console

Then:
- Create `.env` file with your Cognito credentials
- Install AWS Amplify: `npm install aws-amplify`
- Update `src/auth.js` with real Cognito code

But for now, the health check should work! 🎉

## 🐛 Troubleshooting

**Frontend won't start?**
- Run `npm install` first
- Make sure port 5173 is free

**Backend not responding?**
- Make sure backend is running: `cd backend && npm run dev`
- Check it's on port 3000

**CORS errors?**
- Vite proxy should handle this automatically
- Make sure both frontend and backend are running

