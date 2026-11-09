import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';
import { Calendar, AlertCircle } from 'lucide-react';
import { HourlyReading } from '../types/aqi';
import { getAqiCategory, formatTime, formatDate } from '../utils/aqiUtils';

interface AqiForecastProps {
  forecast: HourlyReading[];
}

export const AqiForecast: React.FC<AqiForecastProps> = ({ forecast }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Group forecast by day (next 4 days)
  const daysMap = new Map<string, HourlyReading[]>();
  forecast.forEach((r) => {
    const dayKey = formatDate(r.time);
    if (!daysMap.has(dayKey)) {
      daysMap.set(dayKey, []);
    }
    daysMap.get(dayKey)?.push(r);
  });

  const dayKeys = Array.from(daysMap.keys()).slice(0, 4);
  const currentDayData = daysMap.get(dayKeys[selectedDayIndex]) || [];

  const chartData = currentDayData.map((r) => ({
    time: r.time,
    formattedTime: formatTime(r.time),
    AQI: r.usAqi,
    'PM2.5': r.pm2_5,
    'PM10': r.pm10,
    category: getAqiCategory(r.usAqi).category,
  }));

  // Identify peak hazard hour
  let peakHour = '';
  let maxAqi = 0;
  currentDayData.forEach((r) => {
    if (r.usAqi > maxAqi) {
      maxAqi = r.usAqi;
      peakHour = formatTime(r.time);
    }
  });

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00ff87] border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-orbitron uppercase">
              72-Hour Atmospheric AQI Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Predictive dispersion computed via European CAMS & NOAA GFS meteorological models
          </p>
        </div>

        {/* Hazard Warning Pill */}
        {maxAqi > 150 && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-1.5 font-mono font-bold shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Peak Smog Inversion: {peakHour} (AQI {maxAqi})</span>
          </div>
        )}
      </div>

      {/* Day Selector Tabs (DevInterio Responsive 2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {dayKeys.map((day, idx) => {
          const readings = daysMap.get(day) || [];
          const avgAqi = readings.length > 0
            ? Math.round(readings.reduce((acc, r) => acc + r.usAqi, 0) / readings.length)
            : 0;
          const cat = getAqiCategory(avgAqi);
          const isSelected = selectedDayIndex === idx;

          return (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#00ff87] text-slate-900 border-emerald-400 shadow-sm'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-orbitron">{day}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-slate-800 text-white">
                  {cat.category}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-orbitron text-slate-900">
                  {avgAqi}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">Avg AQI</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Forecast Line Chart for Selected Day */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="formattedTime" 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              interval={2}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const curr = payload[0].payload;
                  const cat = getAqiCategory(curr.AQI);
                  return (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg font-mono text-xs space-y-1">
                      <div className="text-slate-500 text-[10px] font-bold">{curr.formattedTime} - PROJECTION</div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-700">Projected AQI:</span>
                        <span className="font-black text-slate-900 font-orbitron">{curr.AQI} ({cat.category})</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-rose-600 font-bold">PM2.5:</span>
                        <span className="font-black text-rose-600 font-orbitron">{curr['PM2.5']} µg/m³</span>
                      </div>
                      <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-100 font-sans">
                        {cat.outdoorAdvisory}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="AQI" 
              stroke="#059669" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#059669' }} 
              activeDot={{ r: 6, fill: '#00ff87' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex items-start gap-2.5 text-xs text-slate-600 font-mono">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-bold">Atmospheric Model: </strong> Forecasts represent boundary layer dispersion simulations via CAMS & NOAA GFS. Ground concentrations may vary locally with hyper-local emissions and temperature inversions.
        </p>
      </div>
    </div>
  );
};
