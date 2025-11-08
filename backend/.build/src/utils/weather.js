"use strict";
// node 18 has fetch built in which is nice
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherAlerts = getWeatherAlerts;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
async function getWeatherAlerts(latitude, longitude) {
    if (!OPENWEATHER_API_KEY) {
        return []; // no api key, can't get weather
    }
    try {
        const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        // @ts-ignore - node-fetch types are annoying
        const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
        const response = await fetch(url);
        const data = await response.json();
        const alerts = [];
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
    }
    catch (error) {
        console.error('Weather API error:', error);
        return [];
    }
}
//# sourceMappingURL=weather.js.map