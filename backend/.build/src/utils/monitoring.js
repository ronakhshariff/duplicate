"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putMetric = putMetric;
exports.trackRequestCreated = trackRequestCreated;
exports.trackRequestCompleted = trackRequestCompleted;
exports.trackAPILatency = trackAPILatency;
exports.trackActiveUser = trackActiveUser;
exports.trackCostMetric = trackCostMetric;
// cloudwatch monitoring for cost tracking and performance
// helps us see how much we're spending and if things are slow
const client_cloudwatch_1 = require("@aws-sdk/client-cloudwatch");
const cloudwatch = new client_cloudwatch_1.CloudWatchClient({ region: process.env.REGION || 'us-east-1' });
const NAMESPACE = 'Neighbourly';
// sends custom metrics to cloudwatch for monitoring
// we use this to track costs and performance
async function putMetric(metricName, value, unit = 'Count', dimensions) {
    try {
        await cloudwatch.send(new client_cloudwatch_1.PutMetricDataCommand({
            Namespace: NAMESPACE,
            MetricData: [
                {
                    MetricName: metricName,
                    Value: value,
                    Unit: unit,
                    Dimensions: dimensions || []
                }
            ]
        }));
    }
    catch (error) {
        console.error('error putting metric:', error);
        // don't throw - monitoring shouldn't break the app
    }
}
// tracks request creation
async function trackRequestCreated(category, urgency) {
    await putMetric('RequestsCreated', 1, 'Count', [
        { Name: 'Category', Value: category },
        { Name: 'Urgency', Value: urgency }
    ]);
}
// tracks request completion
async function trackRequestCompleted(durationSeconds) {
    await putMetric('RequestsCompleted', 1);
    await putMetric('RequestDuration', durationSeconds, 'Seconds');
}
// tracks api latency
async function trackAPILatency(endpoint, latencyMs) {
    await putMetric('APILatency', latencyMs, 'Milliseconds', [
        { Name: 'Endpoint', Value: endpoint }
    ]);
}
// tracks active users
async function trackActiveUser() {
    await putMetric('ActiveUsers', 1);
}
// tracks cost-related metrics (lambda invocations, dynamodb reads, etc)
async function trackCostMetric(service, operation, count) {
    await putMetric('CostMetrics', count, 'Count', [
        { Name: 'Service', Value: service },
        { Name: 'Operation', Value: operation }
    ]);
}
//# sourceMappingURL=monitoring.js.map