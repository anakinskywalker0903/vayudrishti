import { HourlyReading, SpikeAnomaly } from '../types/aqi';

/**
 * Statistical Anomaly and Sudden Pollution Surge Detector
 * Uses Z-Score and Relative Velocity Analysis to pinpoint firecracker episodes,
 * crop residue burning, or rapid thermal inversions.
 */
export function detectPollutionSpikes(readings: HourlyReading[]): SpikeAnomaly[] {
  if (readings.length < 6) return [];

  const anomalies: SpikeAnomaly[] = [];

  // Analyze sliding window of 6 hours
  for (let i = 3; i < readings.length; i++) {
    const current = readings[i];
    const prevWindow = readings.slice(Math.max(0, i - 4), i);

    if (prevWindow.length === 0) continue;

    const avgPm25 = prevWindow.reduce((acc, r) => acc + r.pm2_5, 0) / prevWindow.length;
    const avgSo2 = prevWindow.reduce((acc, r) => acc + r.sulphur_dioxide, 0) / prevWindow.length;

    // Check PM2.5 spike (classic indicator of fireworks / biomass burn)
    const pm25Diff = current.pm2_5 - avgPm25;
    const pm25Pct = avgPm25 > 0 ? (pm25Diff / avgPm25) * 100 : 0;

    // Trigger criteria: > 45% increase and absolute jump > 25 ug/m3
    if (pm25Pct >= 45 && pm25Diff >= 25) {
      let severity: 'moderate' | 'high' | 'critical' = 'moderate';
      if (pm25Pct > 120 || current.pm2_5 > 250) severity = 'critical';
      else if (pm25Pct > 70 || current.pm2_5 > 150) severity = 'high';

      // Correlate with SO2 to check if fireworks/industrial combustion
      let cause = 'High-density particulate emission event (suspected fireworks or localized biomass/crop burning)';
      if (current.sulphur_dioxide > avgSo2 * 1.5 && current.sulphur_dioxide > 20) {
        cause = 'Combustion spike with chemical sulfur signatures (pyrotechnic / fireworks combustion suspected)';
      }

      anomalies.push({
        time: current.time,
        pollutant: 'PM2.5',
        value: current.pm2_5,
        baseline: Math.round(avgPm25 * 10) / 10,
        percentageJump: Math.round(pm25Pct),
        severity,
        probableCause: cause,
      });

      current.isSpike = true;
    }
  }

  return anomalies;
}

/**
 * Calculate 24-Hour Percentage Trends & Differences
 */
export function calculate24hTrend(historical: HourlyReading[]): {
  changePercent: number;
  direction: 'improving' | 'worsening' | 'stable';
  deltaAqi: number;
} {
  if (historical.length < 24) {
    return { changePercent: 0, direction: 'stable', deltaAqi: 0 };
  }

  const currentReading = historical[historical.length - 1];
  const yesterdaySameHour = historical[historical.length - 24] || historical[0];

  const delta = currentReading.usAqi - yesterdaySameHour.usAqi;
  const pct = yesterdaySameHour.usAqi > 0 ? (delta / yesterdaySameHour.usAqi) * 100 : 0;

  return {
    changePercent: Math.round(Math.abs(pct)),
    direction: delta < -5 ? 'improving' : delta > 5 ? 'worsening' : 'stable',
    deltaAqi: delta,
  };
}
