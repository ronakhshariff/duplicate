export interface WeatherAlert {
    type: 'heatwave' | 'cold' | 'storm' | 'flood' | 'other';
    severity: 'low' | 'medium' | 'high';
    message: string;
    temperature?: number;
    condition?: string;
}
export declare function getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherAlert[]>;
//# sourceMappingURL=weather.d.ts.map