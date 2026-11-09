import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { History, TrendingUp, AlertTriangle, Calendar, Zap, Activity } from 'lucide-react';
import { HourlyReading, SpikeAnomaly } from '../types/aqi';
import { formatTime, formatDate } from '../utils/aqiUtils';

interface HistoricalTrendsProps {
  historical: HourlyReading[];
  anomalies: SpikeAnomaly[];
}

export const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ historical, anomalies }) => {
  const [range, setRange] = useState<'24h' | '48h' | '72h'>('48h');
  const [metric, setMetric] = useState<'aqi' | 'particulate' | 'gases'>('aqi');

  // Filter historical items based on selected range
  const count = range === '24h' ? 24 : range === '48h' ? 48 : 72;
  const data = historical.slice(-count).map((r) => ({
    time: r.time,
    formattedTime: formatTime(r.time),
    formattedDate: formatDate(r.time),
    AQI: r.usAqi,
    'PM2.5': r.pm2_5,
    'PM10': r.pm10,
    'NO₂': r.nitrogen_dioxide,
    'SO₂': r.sulphur_dioxide,
    'Ozone': r.ozone,
    isSpike: r.isSpike,
  }));

  // Calculate highest recorded value in current view
  const maxAqi = Math.max(...data.map((d) => d.AQI), 0);
  const minAqi = Math.min(...data.map((d) => d.AQI), 500);

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5 text-slate-800 font-sans">
      {/* Header & Controls (Mobile responsive wrap) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00ff87] border border-slate-200 shadow-sm">
              <History className="w-4 h-4 text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-orbitron uppercase">
              Historical Pollution Tracker & Spikes
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Time-series telemetry with automated ML sudden-spike detection
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setMetric('aqi')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === 'aqi' ? 'bg-[#00ff87] text-slate-950 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AQI
            </button>
            <button
              onClick={() => setMetric('particulate')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === 'particulate' ? 'bg-[#00ff87] text-slate-950 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PM2.5 vs PM10
            </button>
            <button
              onClick={() => setMetric('gases')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === 'gases' ? 'bg-[#00ff87] text-slate-950 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NO₂ & SO₂
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-mono">
            {(['24h', '48h', '72h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  range === r ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary Bar (DevInterio Responsive 2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-bold uppercase text-[10px]">Peak Observed AQI</div>
          <div className="text-xl sm:text-2xl font-black font-orbitron text-rose-600 mt-0.5">{maxAqi}</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-bold uppercase text-[10px]">Lowest Observed AQI</div>
          <div className="text-xl sm:text-2xl font-black font-orbitron text-emerald-600 mt-0.5">{minAqi}</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-bold uppercase text-[10px]">Spike Episodes</div>
          <div className="text-xl sm:text-2xl font-black font-orbitron text-amber-600 mt-0.5">{anomalies.length} Events</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-bold uppercase text-[10px]">Sampling Interval</div>
          <div className="text-xl sm:text-2xl font-black font-orbitron text-slate-800 mt-0.5">1-Hr CAMS</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-64 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorSo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="formattedTime" 
              stroke="#64748b" 
              fontSize={10}
              tickLine={false}
              interval={Math.floor(data.length / 6)}
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
                  return (
                    <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutalist font-mono text-xs space-y-1">
                      <div className="text-slate-600 text-[10px] font-bold">{curr.formattedDate} at {curr.formattedTime}</div>
                      {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span style={{ color: entry.color }} className="font-bold">{entry.name}:</span>
                          <span className="font-black text-black font-orbitron">{entry.value}</span>
                        </div>
                      ))}
                      {curr.isSpike && (
                        <div className="pt-1 mt-1 border-t border-slate-200 text-[10px] text-amber-600 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Detected rapid pollution surge</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            {/* Render selected series */}
            {metric === 'aqi' && (
              <>
                <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate (100)', fill: '#b45309', fontSize: 10 }} />
                <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Unhealthy (200)', fill: '#b91c1c', fontSize: 10 }} />
                <Area 
                  type="monotone" 
                  dataKey="AQI" 
                  stroke="#059669" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorAqi)" 
                />
              </>
            )}

            {metric === 'particulate' && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="PM2.5" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorPm25)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="PM10" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPm10)" 
                />
              </>
            )}

            {metric === 'gases' && (
              <>
                <Area 
                  type="monotone" 
                  dataKey="NO₂" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPm10)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="SO₂" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSo2)" 
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Detected Anomaly Callouts */}
      {anomalies.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <div className="text-xs font-mono font-bold text-amber-700 flex items-center gap-1.5 mb-2 font-orbitron uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            AUTOMATED SPIKE AUDIT ({anomalies.length} RECENT EVENTS)
          </div>
          <div className="space-y-2">
            {anomalies.slice(-3).map((a, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm"
              >
                <div>
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{a.pollutant} surged +{a.percentageJump}%</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                      {formatTime(a.time)}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    {a.probableCause}
                  </div>
                </div>
                <div className="font-mono text-xs text-right">
                  <div className="text-slate-500 text-[10px] font-bold">Peak vs Baseline</div>
                  <div className="font-black text-amber-800 font-orbitron">{a.value} vs {a.baseline} µg/m³</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
