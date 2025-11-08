# Cost Analysis - Neighbourly Backend

Cost projection for running Neighbourly at scale. All services stay within free tier for small usage, and scale cost-effectively.

## Free Tier Coverage (First Year)

- **Lambda**: 1M requests/month free
- **DynamoDB**: 25GB storage + 25 read/write units free
- **API Gateway**: 1M requests/month free
- **S3**: 5GB storage free
- **SNS**: 1M publishes/month free
- **Location Service**: 50k requests/month free (Esri data source)
- **Comprehend**: 50k units/month free
- **Translate**: 2M characters/month free
- **Rekognition**: 5k images/month free

## Cost Projection (100k Monthly Active Users)

Assuming:
- 10 requests per user per month
- 1M total requests/month
- Average request lifecycle: 2 hours

### Lambda
- Invocations: 1M/month (free tier covers this)
- **Cost: $0**

### DynamoDB
- Storage: ~50GB (assuming 1KB per request)
- Reads: ~5M/month (queries, gets)
- Writes: ~1M/month (creates, updates)
- **Cost: ~$5-10/month** (pay-per-request pricing)

### API Gateway
- 1M requests/month
- **Cost: $0** (free tier)

### S3
- Storage: ~10GB (images)
- Requests: ~500k/month
- **Cost: ~$2-3/month**

### SNS
- 1M notifications/month
- **Cost: $0** (free tier)

### Location Service
- 1M geocoding requests/month
- **Cost: ~$5/month** (after free tier)

### AI Services (Comprehend, Translate, Rekognition)
- Well within free tier limits
- **Cost: $0**

### Total Estimated Cost: **~$15-20/month** for 100k MAU

## Monitoring

CloudWatch Dashboard tracks:
- Lambda invocations and errors
- DynamoDB read/write capacity
- API latency
- Custom metrics (requests created, completed)

This helps identify cost spikes and optimize usage.

## Cost Optimization Tips

1. Use DynamoDB TTL for old requests (auto-delete after 90 days)
2. Compress images before storing in S3
3. Cache translations in DynamoDB (already implemented)
4. Use Location Service Esri data source (cheaper than Here/Grab)
5. Monitor CloudWatch metrics to catch unusual usage

