// cloudwatch monitoring for cost tracking and performance
// helps us see how much we're spending and if things are slow
import { CloudWatchClient, PutMetricDataCommand, Dimension } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: process.env.REGION || 'us-east-1' });
const NAMESPACE = 'Neighbourly';

// sends custom metrics to cloudwatch for monitoring
// we use this to track costs and performance
export async function putMetric(
  metricName: string,
  value: number,
  unit: 'Count' | 'Seconds' | 'Milliseconds' = 'Count',
  dimensions?: Dimension[]
): Promise<void> {
  try {
    await cloudwatch.send(new PutMetricDataCommand({
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
  } catch (error) {
    console.error('error putting metric:', error);
    // don't throw - monitoring shouldn't break the app
  }
}

// tracks request creation
export async function trackRequestCreated(category: string, urgency: string): Promise<void> {
  await putMetric('RequestsCreated', 1, 'Count', [
    { Name: 'Category', Value: category },
    { Name: 'Urgency', Value: urgency }
  ]);
}

// tracks request completion
export async function trackRequestCompleted(durationSeconds: number): Promise<void> {
  await putMetric('RequestsCompleted', 1);
  await putMetric('RequestDuration', durationSeconds, 'Seconds');
}

// tracks api latency
export async function trackAPILatency(endpoint: string, latencyMs: number): Promise<void> {
  await putMetric('APILatency', latencyMs, 'Milliseconds', [
    { Name: 'Endpoint', Value: endpoint }
  ]);
}

// tracks active users
export async function trackActiveUser(): Promise<void> {
  await putMetric('ActiveUsers', 1);
}

// tracks cost-related metrics (lambda invocations, dynamodb reads, etc)
export async function trackCostMetric(service: string, operation: string, count: number): Promise<void> {
  await putMetric('CostMetrics', count, 'Count', [
    { Name: 'Service', Value: service },
    { Name: 'Operation', Value: operation }
  ]);
}

