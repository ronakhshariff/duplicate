import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export interface AdminStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalVolunteers: number;
  requestsByCategory: Record<string, number>;
  requestsByUrgency: Record<string, number>;
  requestsByStatus: Record<string, number>;
  recentActivity: number; // Requests created in last 24 hours
}

export const getStats = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const city = event.queryStringParameters?.city;
    const region = event.queryStringParameters?.region;
    
    // scan all requests - might be slow with lots of data but works for now
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':skPrefix': 'request#'
      }
    }));
    
    const requests = result.Items || [];
    
    // filter by city/region if provided
    let filteredRequests = requests;
    if (city && region) {
      filteredRequests = requests.filter((r: any) => r.PK === `${city}#${region}`);
    }
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24 hours
    
    const stats: AdminStats = {
      totalRequests: filteredRequests.length,
      activeRequests: filteredRequests.filter((r: any) => r.status === 'open' || r.status === 'accepted' || r.status === 'in_progress').length,
      completedRequests: filteredRequests.filter((r: any) => r.status === 'completed').length,
      totalVolunteers: new Set(filteredRequests.map((r: any) => r.acceptedBy).filter(Boolean)).size,
      requestsByCategory: {},
      requestsByUrgency: {},
      requestsByStatus: {},
      recentActivity: filteredRequests.filter((r: any) => {
        const createdAt = new Date(r.createdAt);
        return createdAt >= oneDayAgo;
      }).length
    };
    
    // count by category
    filteredRequests.forEach((r: any) => {
      const category = r.category || 'general';
      stats.requestsByCategory[category] = (stats.requestsByCategory[category] || 0) + 1;
    });
    
    // count by urgency
    filteredRequests.forEach((r: any) => {
      const urgency = r.urgency || 'medium';
      stats.requestsByUrgency[urgency] = (stats.requestsByUrgency[urgency] || 0) + 1;
    });
    
    // count by status
    filteredRequests.forEach((r: any) => {
      const status = r.status || 'open';
      stats.requestsByStatus[status] = (stats.requestsByStatus[status] || 0) + 1;
    });
    
    console.log('stats calculated:', stats.totalRequests, 'requests');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stats)
    };
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error?.message || 'failed' })
    };
  }
};

export const getHeatmapData = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const city = event.queryStringParameters?.city;
    const region = event.queryStringParameters?.region;
    
    // grab all the requests (same scan as stats, could optimize later)
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':skPrefix': 'request#'
      }
    }));
    
    let requests = result.Items || [];
    
    if (city && region) {
      requests = requests.filter((r: any) => r.PK === `${city}#${region}`);
    }
    
    // cluster nearby requests together
    const clusters: Array<{
      latitude: number;
      longitude: number;
      count: number;
      requests: any[];
    }> = [];
    
    const clusterRadius = 0.01; // about 1km, might need to adjust
    
    requests.forEach((request: any) => {
      if (!request.location) return;
      
      const lat = request.location.latitude;
      const lon = request.location.longitude;
      
      let foundCluster = false;
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(cluster.latitude - lat, 2) + Math.pow(cluster.longitude - lon, 2)
        );
        
        if (distance < clusterRadius) {
          cluster.count++;
          cluster.requests.push(request);
          foundCluster = true;
          break;
        }
      }
      
      if (!foundCluster) {
        clusters.push({
          latitude: lat,
          longitude: lon,
          count: 1,
          requests: [request]
        });
      }
    });
    
    const heatmapPoints = clusters.map(cluster => {
      if (cluster.requests.length === 1) {
        return {
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          intensity: 1,
          requestCount: 1
        };
      }
      
      const avgLat = cluster.requests.reduce((sum, r) => sum + r.location.latitude, 0) / cluster.requests.length;
      const avgLon = cluster.requests.reduce((sum, r) => sum + r.location.longitude, 0) / cluster.requests.length;
      
      return {
        latitude: avgLat,
        longitude: avgLon,
        intensity: Math.min(cluster.count / 10, 1),
        requestCount: cluster.count
      };
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ heatmap: heatmapPoints })
    };
  } catch (error: any) {
    console.error('Error getting heatmap data:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error?.message || 'failed' })
    };
  }
};

