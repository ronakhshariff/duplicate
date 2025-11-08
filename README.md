# Burrowly

Community resilience network - basically an app where neighbors can help each other out. Someone needs help moving? Post a request. Someone needs groceries? Post a request. You get the idea.

## What's This?

Full stack app with:
- **Frontend** - React + Vite (in `src/`)
- **Backend** - Serverless AWS backend (in `backend/`)

Everything is serverless so it scales automatically and costs basically nothing for small usage.

## Quick Start

### Frontend
```bash
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:3000/dev/` (different port or use proxy)

## Structure

- `src/` - frontend code (React)
- `backend/src/` - backend code (Lambda handlers)
- `backend/docs/` - api documentation
- `backend/serverless.yml` - aws config

Check out `backend/README.md` for backend details.
