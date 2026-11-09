import { AqiCategory } from '../types/aqi';

export function getAqiCategory(aqi: number): {
  category: AqiCategory;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  description: string;
  outdoorAdvisory: string;
  maskRecommendation: string;
  windowVentilation: string;
} {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#10b981',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      outdoorAdvisory: 'Ideal conditions for all outdoor sports, workouts, and running.',
      maskRecommendation: 'No mask required for general public.',
      windowVentilation: 'Enjoy fresh air! Great time to ventilate living spaces.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Moderate',
      color: '#f59e0b',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      description: 'Air quality is acceptable; however, some pollutants may cause moderate health concern for unusually sensitive individuals.',
      outdoorAdvisory: 'Safe for most people. Sensitive individuals may consider reducing prolonged outdoor exertion.',
      maskRecommendation: 'Not necessary for healthy individuals; sensitive people may wear a surgical mask.',
      windowVentilation: 'Normal ventilation fine; close windows if near heavy traffic.',
    };
  } else if (aqi <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      bgClass: 'bg-orange-500/10',
      textClass: 'text-orange-400',
      borderClass: 'border-orange-500/30',
      badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      description: 'Members of sensitive groups (children, elderly, people with asthma or heart disease) may experience health effects.',
      outdoorAdvisory: 'Sensitive individuals should limit strenuous outdoor activity; take frequent breaks.',
      maskRecommendation: 'N95 or KN95 recommended for sensitive groups and cyclists/runners.',
      windowVentilation: 'Keep windows closed during morning and evening rush/inversion hours.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      color: '#ef4444',
      bgClass: 'bg-rose-500/10',
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500/30',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
      outdoorAdvisory: 'Avoid prolonged high-intensity outdoor cardio. Exercise indoors.',
      maskRecommendation: 'Wear a well-fitted N95 / FFP2 mask whenever stepping outdoors.',
      windowVentilation: 'Keep windows and doors securely closed. Run HEPA air purifiers indoors.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Very Unhealthy',
      color: '#a855f7',
      bgClass: 'bg-purple-500/10',
      textClass: 'text-purple-400',
      borderClass: 'border-purple-500/30',
      badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      description: 'Health alert: The risk of health effects is increased for everyone in the population.',
      outdoorAdvisory: 'Strictly avoid outdoor exertion. Children, seniors, and pregnant women should remain indoors.',
      maskRecommendation: 'Strict N95/N99 mask requirement for any essential outdoor transit.',
      windowVentilation: 'Seal doors and windows; use indoor recirculation on HVAC or air purifiers.',
    };
  } else {
    return {
      category: 'Hazardous',
      color: '#881337',
      bgClass: 'bg-red-950/30',
      textClass: 'text-red-400',
      borderClass: 'border-red-600/40',
      badgeClass: 'bg-red-950/60 text-red-300 border border-red-500/40',
      description: 'Health warning of emergency conditions: The entire population is more likely to be affected with severe symptoms.',
      outdoorAdvisory: 'Emergency pollution crisis. Suspend all outdoor activities.',
      maskRecommendation: 'N99 or dual-filter respirators required outdoors.',
      windowVentilation: 'Emergency indoor isolation mode. Maximize HEPA air purifier filtering.',
    };
  }
}

// Convert pollutant raw values to Indian CPCB or US EPA equivalent
export function getDominantPollutant(pollutants: {
  pm2_5: number;
  pm10: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
  carbon_monoxide: number;
}): string {
  // Approximate WHO-normalized impact ratio
  const ratios = [
    { name: 'PM2.5', ratio: pollutants.pm2_5 / 15 },
    { name: 'PM10', ratio: pollutants.pm10 / 45 },
    { name: 'NO₂', ratio: pollutants.nitrogen_dioxide / 25 },
    { name: 'Ozone', ratio: pollutants.ozone / 100 },
    { name: 'SO₂', ratio: pollutants.sulphur_dioxide / 40 },
    { name: 'CO', ratio: (pollutants.carbon_monoxide / 1000) / 4 },
  ];
  ratios.sort((a, b) => b.ratio - a.ratio);
  return ratios[0]?.name || 'PM2.5';
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
  } catch {
    return isoString;
  }
}
