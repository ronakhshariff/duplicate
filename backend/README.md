# Neighbourly Backend

Serverless backend built on AWS. All the code lives here.

## Project Structure

```
backend/
├── src/
│   ├── handlers/     # lambda functions
│   └── utils/         # helper functions
├── docs/              # documentation
├── serverless.yml     # aws config
└── package.json       # dependencies
```

## Quick Start

```bash
npm install
npm run dev
```

Server runs at `http://localhost:3000/dev/`

**Note:** All routes are prefixed with `/dev` (the stage name).
- ✅ `http://localhost:3000/dev/requests`
- ❌ `http://localhost:3000/requests`

Test it: `curl http://localhost:3000/dev/`

## Deploy

```bash
npm run deploy:dev    # deploy to dev
npm run deploy:prod   # deploy to prod
```

## Environment Variables

You'll need these (set in aws or `.env`):
- `COGNITO_USER_POOL_ID` - cognito pool id
- `COGNITO_USER_POOL_CLIENT_ID` - cognito client id
- `OPENWEATHER_API_KEY` - optional, for weather alerts
- `REGION` - aws region (default: us-east-1)

## Documentation

All the docs are in `docs/`:
- `API.md` - api endpoints and how to use them
- `AUTH_FLOW.md` - how to get cognito tokens
- `FRONTEND_INTEGRATION_CHECKLIST.md` - stuff for frontend team
- `COST_ANALYSIS.md` - how much this costs to run

## What It Does

- Request management (create, accept, update status)
- User profiles
- Messaging between users
- Push notifications (via SNS)
- Image uploads (S3)
- AI stuff (categorization, translation, image analysis)
- Weather alerts
- Location services (geocoding)
- IoT sensor integration (for automated alerts)
- Admin stats and heatmaps
- Cost monitoring

## AWS Services

Uses:
- Lambda (functions)
- API Gateway (rest api)
- DynamoDB (database)
- S3 (images)
- Cognito (auth)
- SNS (notifications)
- Location Service (maps/geocoding)
- CloudWatch (monitoring)
- IoT Core (sensors)
- Comprehend, Translate, Rekognition (AI)

