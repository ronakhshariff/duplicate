# Neighbourly API Reference

Quick reference for frontend integration. All endpoints require Cognito auth unless noted.

Base URL: `https://your-api-id.execute-api.us-east-1.amazonaws.com/dev` (or `http://localhost:3000/dev` for local)

## Authentication

All endpoints (except health check) require a Cognito JWT token in the Authorization header:
```
Authorization: Bearer YOUR_COGNITO_TOKEN
```

## Endpoints

### Health Check
**GET /** - No auth required
```json
{
  "status": "ok",
  "message": "Neighbourly API is running",
  "baseUrl": "/dev",
  "endpoints": { ... }
}
```

### Requests

#### Create Request
**POST /requests**
```json
{
  "title": "Need help moving",
  "description": "Moving furniture to second floor",
  "location": {
    "latitude": 43.6532,
    "longitude": -79.3832,
    "city": "toronto",
    "region": "ontario",
    "address": "123 Main St"
  },
  "category": "moving", // optional, auto-detected
  "urgency": "medium" // optional, auto-detected
}
```

Response:
```json
{
  "requestId": "req-1234567890-abc123",
  "title": "Need help moving",
  "status": "open",
  "category": "moving",
  "urgency": "medium",
  "weatherAlerts": [...],
  "aiCategory": "moving",
  "aiPriority": { "urgency": "medium", "reason": "..." }
}
```

#### Get Requests
**GET /requests?city=toronto&region=ontario&limit=20&offset=0**

Query params:
- `city` (required)
- `region` (required)
- `status` (optional): open, accepted, in_progress, completed, cancelled
- `category` (optional)
- `urgency` (optional): low, medium, high, emergency
- `search` (optional): search in title/description
- `latitude`, `longitude` (optional): for distance sorting
- `radius` (optional): filter by radius in km
- `preferredLanguage` (optional): auto-translate descriptions
- `limit` (optional, default 50): pagination
- `offset` (optional, default 0): pagination

Response:
```json
{
  "requests": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Single Request
**GET /requests/{requestId}?city=toronto&region=ontario**

Response: Single request object

#### Accept Request
**POST /requests/{requestId}/accept?city=toronto&region=ontario**

Response:
```json
{
  "message": "accepted",
  "requestId": "req-123",
  "acceptedBy": "user-id"
}
```

#### Update Request Status
**PUT /requests/{requestId}/status?city=toronto&region=ontario**
```json
{
  "status": "in_progress" // or "completed", "cancelled"
}
```

### User Profile

#### Get Current User
**GET /users/me?city=toronto&region=ontario**

Response:
```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "city": "toronto",
  "region": "ontario"
}
```

#### Update Current User
**PUT /users/me?city=toronto&region=ontario**
```json
{
  "name": "John Doe",
  "phone": "123-456-7890",
  "bio": "I like helping people",
  "skillsOffered": ["moving", "cooking"],
  "preferredLanguage": "en"
}
```

### Messaging

#### Send Message
**POST /requests/{requestId}/messages**
```json
{
  "toUserId": "user-id",
  "message": "Hey, I can help with that!"
}
```

#### Get Messages
**GET /requests/{requestId}/messages**

Response:
```json
{
  "messages": [
    {
      "messageId": "msg-123",
      "fromUserId": "user-1",
      "toUserId": "user-2",
      "message": "Hey!",
      "createdAt": "2024-01-01T00:00:00Z",
      "read": false
    }
  ]
}
```

### Notifications

#### Get Notifications
**GET /notifications?limit=50&offset=0**

Response:
```json
{
  "notifications": [...],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Mark Notification Read
**PUT /notifications/{notificationId}/read**

#### Get Unread Count
**GET /notifications/unread-count**

Response:
```json
{
  "count": 5
}
```

### Image Upload

#### Get Presigned URL
**GET /upload/presigned?filename=photo.jpg&contentType=image/jpeg&requestId=req-123**

Response:
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "key": "requests/req-123/user-123-1234567890.jpg"
}
```

#### Upload Image (direct)
**POST /upload**
```json
{
  "requestId": "req-123",
  "filename": "photo.jpg",
  "contentType": "image/jpeg",
  "image": "base64-encoded-image"
}
```

### AI Services

#### Analyze Image
**POST /ai/analyze-image**
```json
{
  "image": "base64-encoded-image"
}
```

#### Translate Text
**POST /ai/translate**
```json
{
  "text": "Hello world",
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

### Weather

#### Get Weather Alerts
**GET /weather/alerts?latitude=43.6532&longitude=-79.3832**

### Admin

#### Get Stats
**GET /admin/stats**

#### Get Heatmap Data
**GET /admin/heatmap**

## Error Responses

All errors follow this format:
```json
{
  "error": "error message here"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid data)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Server Error

## Notes

- All routes are prefixed with `/dev` (the stage name)
- All endpoints require Cognito auth except health check
- City and region are usually required as query params for requests
- Pagination uses limit/offset pattern
- CORS is enabled for all endpoints

