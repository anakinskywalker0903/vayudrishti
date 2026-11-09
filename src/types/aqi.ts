export type AqiCategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface CurrentAirQuality {
  usAqi: number;
  europeanAqi: number;
  category: AqiCategory;
  categoryColor: string;
  categoryBg: string;
  dominantPollutant: string;
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
  ozone: number;
  dust?: number;
  uvIndex: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number; // in km
  pressure: number;   // in hPa
  precipitation: number; // in mm
  weatherCondition: string;
  sunrise: string;
  sunset: string;
  isForecast: boolean;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherCondition: string;
  rainChance: number;
  avgAqi: number;
}

export interface HourlyReading {
  time: string;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
  temperature?: number;
  isForecast: boolean;
  isSpike?: boolean;
}

export interface LocationInfo {
  name: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AirQualityDataset {
  location: LocationInfo;
  current: CurrentAirQuality;
  historical: HourlyReading[];
  forecast: HourlyReading[];
  dailyForecast: DailyForecastItem[];
  source: string;
  lastUpdated: string;
}

export interface SpikeAnomaly {
  time: string;
  pollutant: string;
  value: number;
  baseline: number;
  percentageJump: number;
  severity: 'moderate' | 'high' | 'critical';
  probableCause: string;
}

export interface CityRanking {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: AqiCategory;
  pm2_5: number;
}
