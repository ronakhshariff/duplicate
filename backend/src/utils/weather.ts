// node 18 has fetch built in which is nice

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherAlert {
  type: 'heatwave' | 'cold' | 'storm' | 'flood' | 'other';
  severity: 'low' | 'medium' | 'high';
  message: string;
  temperature?: number;
  condition?: string;
}

export async function getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherAlert[]> {
  if (!OPENWEATHER_API_KEY) {
    return []; // no api key, can't get weather
  }
  
  try {
    const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    // @ts-ignore - node-fetch types are annoying
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const data = await response.json() as any;
    
    const alerts: WeatherAlert[] = [];
    const temp = data.main?.temp;
    const condition = data.weather?.[0]?.main?.toLowerCase() || '';
    
    // if it's super hot, warn people (check on elderly neighbors)
    if (temp > 35) {
      alerts.push({
        type: 'heatwave',
        severity: temp > 40 ? 'high' : 'medium',
        message: `High temperature alert: ${temp}°C. Consider checking on elderly neighbors.`,
        temperature: temp,
        condition
      });
    }
    
    // if it's freezing, also warn (make sure people have heat)
    if (temp < -10) {
      alerts.push({
        type: 'cold',
        severity: temp < -20 ? 'high' : 'medium',
        message: `Extreme cold alert: ${temp}°C. Ensure vulnerable neighbors have heating.`,
        temperature: temp,
        condition
      });
    }
    
    // storms are bad too (stay safe)
    if (condition.includes('storm') || condition.includes('thunder')) {
      alerts.push({
        type: 'storm',
        severity: 'high',
        message: `Severe weather alert: ${condition}. Stay safe and check on neighbors.`,
        temperature: temp,
        condition
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('Weather API error:', error);
    return [];
  }
}

