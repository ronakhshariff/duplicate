import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const healthCheck = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'Neighbourly API is running',
      baseUrl: event.requestContext?.path?.replace('/', '') || '/dev',
      endpoints: {
        requests: '/requests',
        users: '/users/me',
        notifications: '/notifications',
        admin: '/admin/stats',
        weather: '/weather/alerts'
      }
    })
  };
};

