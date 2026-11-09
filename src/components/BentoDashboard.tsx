import React from 'react';
import { 
  MapPin, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sun, 
  CloudRain, 
  Sunrise, 
  Sunset, 
  ChevronLeft, 
  ChevronRight,
  CloudSun,
  Map as MapIcon,
  Bot,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { AirQualityDataset, LocationInfo } from '../types/aqi';
import { PRESET_CITIES } from '../services/airQualityApi';
import { getAqiCategory } from '../utils/aqiUtils';

interface BentoDashboardProps {
  dataset: AirQualityDataset;
  onSelectCity: (loc: LocationInfo) => void;
  onOpenMap: () => void;
  onOpenAi: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  dataset,
  onSelectCity,
  onOpenMap,
  onOpenAi,
}) => {
  const { current, location, dailyForecast, forecast } = dataset;
  const cat = getAqiCategory(current.usAqi);

  const quickCities = [
    PRESET_CITIES.find(c => c.name.includes('Lucknow')) || PRESET_CITIES[6],
    PRESET_CITIES.find(c => c.name.includes('Mumbai')) || PRESET_CITIES[1],
    PRESET_CITIES.find(c => c.name.includes('Delhi')) || PRESET_CITIES[0],
    PRESET_CITIES.find(c => c.name.includes('Bengaluru')) || PRESET_CITIES[2],
  ];

  const chartHours = forecast.slice(0, 7).map((r, idx) => ({
    hour: new Date(r.time).getHours().toString(),
    temp: r.temperature ?? Math.round(current.temperature - idx * 0.3),
    aqi: r.usAqi,
  }));

  const riskDays = dailyForecast && dailyForecast.length > 0 ? dailyForecast.slice(0, 7) : [
    { dayName: 'Wednesday', rainChance: 75, avgAqi: current.usAqi, maxTemp: 28 },
    { dayName: 'Thursday', rainChance: 80, avgAqi: current.usAqi + 10, maxTemp: 27 },
    { dayName: 'Sunday', rainChance: 65, avgAqi: current.usAqi - 15, maxTemp: 28 },
    { dayName: 'Friday', rainChance: 85, avgAqi: current.usAqi + 25, maxTemp: 28 },
    { dayName: 'Saturday', rainChance: 70, avgAqi: current.usAqi + 18, maxTemp: 27 },
    { dayName: 'Tuesday', rainChance: 60, avgAqi: current.usAqi - 5, maxTemp: 28 },
    { dayName: 'Monday', rainChance: 55, avgAqi: current.usAqi - 10, maxTemp: 27 },
  ];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5 text-slate-800 font-sans">
      {/* ============================================================== */}
      {/* ROW 1: Hero Maximalist Card | 7-Day & Forecast Chart | Sunrise/Sunset */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* TOP LEFT: Professional White & Cyber Green Hero Card */}
        <div className="lg:col-span-4 rounded-2xl bg-white p-5 sm:p-6 text-slate-900 flex flex-col justify-between relative overflow-hidden min-h-[310px] border border-slate-200 shadow-sm">
          {/* Subtle Cyber Green Corner Badge */}
          <div className="flex items-center justify-between z-10 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 font-black text-sm text-slate-900 font-orbitron tracking-tight">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{location.name}</span>
            </div>
            <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {new Date().toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Main Weather Metric with Orbitron Typography */}
          <div className="my-auto py-3 z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                <CloudSun className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-black tracking-tight font-orbitron text-slate-900">
                  {current.temperature.toFixed(1)} <span className="text-2xl font-normal font-sans">°C</span>
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1 uppercase font-mono tracking-wider flex items-center gap-2">
                  <span>{current.weatherCondition}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-black">{cat.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom City Switcher Carousel (White & Green Maximalist) */}
          <div className="z-10 pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
            <button className="p-1 text-slate-500 hover:text-emerald-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {quickCities.map((city, idx) => {
                const isActive = city.name === location.name;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-mono border ${
                      isActive
                        ? 'bg-[#00ff87] text-slate-950 border-emerald-400 shadow-sm font-orbitron'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{city.name.split(' ')[0]} </span>
                    <span className="text-[11px] opacity-80">
                      {idx === 0 ? '36.3°C' : idx === 1 ? '27.4°C' : idx === 2 ? '32.2°C' : '24.1°C'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button className="p-1 text-slate-500 hover:text-emerald-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOP MIDDLE: 7-Day Mini Cards & Forecast Chart (Maximalist White & Green) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-[310px]">
          {/* 7-Day Mini Cards Row (Responsive Horizontal Carousel on Mobile) */}
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 overflow-x-auto no-scrollbar touch-pan-x">
            {riskDays.map((day, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-center justify-between p-2 sm:p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm min-w-[58px] sm:min-w-0 sm:flex-1 shrink-0"
              >
                <span className="text-[10px] text-slate-600 font-bold uppercase font-mono">
                  {day.dayName.slice(0, 3)}
                </span>
                <CloudSun className="w-4 h-4 text-emerald-600 my-1" />
                <span className="text-[10px] font-mono font-black text-slate-800">
                  {day.maxTemp ?? 28}°C
                </span>
              </div>
            ))}
          </div>

          {/* Weather Forecast Line Chart */}
          <div className="pt-2 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-900 font-black font-orbitron px-1">
              <span>HOURLY TRAJECTORY</span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">NEXT 7 HOURS</span>
            </div>

            <div className="h-36 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartHours} margin={{ top: 15, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    fontWeight="bold"
                    tickLine={false}
                    tickFormatter={(val) => `${val}:00`}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const curr = payload[0].payload;
                        return (
                          <div className="p-2 rounded-lg bg-white border-2 border-slate-300 font-mono text-xs shadow-brutalist">
                            <div className="text-emerald-700 font-bold font-orbitron">{curr.temp}°C</div>
                            <div className="text-slate-800 text-[10px]">AQI: {curr.aqi}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="natural" 
                    dataKey="temp" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#64748b' }}
                    activeDot={{ r: 6, fill: '#00ff87' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Sunrise and Sunset Card (White & Green) */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-[310px]">
          <div>
            <h3 className="text-xs text-slate-800 font-black tracking-wide uppercase font-orbitron border-b border-slate-100 pb-2">
              DIURNAL CYCLE
            </h3>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Sunrise */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sunrise className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold uppercase font-mono">Sunrise</div>
                <div className="text-lg font-black font-orbitron text-slate-900">
                  {current.sunrise}
                </div>
              </div>
            </div>

            {/* Sunset */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sunset className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold uppercase font-mono">Sunset</div>
                <div className="text-lg font-black font-orbitron text-slate-900">
                  {current.sunset}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono font-bold text-slate-500 text-center pt-2 border-t border-slate-100">
            SOLAR PHOTOMETRY ACTIVE
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ROW 2: 6 Ambient Meteorological Cards | Air Quality Overview | Chances of Rain */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* BOTTOM LEFT: 2x3 Grid of 6 Weather & Dispersion Metrics */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          {/* 1. Humidity */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <Droplets className="w-4 h-4 text-emerald-600" />
              <span>Humidity</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.humidity}</span>
              <span className="text-xs text-slate-500 font-mono ml-1">%</span>
            </div>
          </div>

          {/* 2. Wind Speed */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>Wind Speed</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.windSpeed}</span>
              <span className="text-xs text-slate-500 font-mono ml-1">Kph</span>
            </div>
          </div>

          {/* 3. Visibility */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Visibility</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.visibility}</span>
              <span className="text-xs text-slate-500 font-mono ml-1">KM</span>
            </div>
          </div>

          {/* 4. Pressure */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <Gauge className="w-4 h-4 text-emerald-600" />
              <span>Pressure</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.pressure}</span>
              <span className="text-xs text-slate-500 font-mono ml-1">mm</span>
            </div>
          </div>

          {/* 5. UV Index */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <Sun className="w-4 h-4 text-emerald-600" />
              <span>UV Index</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.uvIndex}</span>
            </div>
          </div>

          {/* 6. Precipitation */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold font-mono uppercase">
              <CloudRain className="w-4 h-4 text-emerald-600" />
              <span>Rainfall</span>
            </div>
            <div className="mt-2 text-right">
              <span className="text-2xl font-black font-orbitron text-slate-900">{current.precipitation}</span>
              <span className="text-xs text-slate-500 font-mono ml-1">mm</span>
            </div>
          </div>
        </div>

        {/* BOTTOM MIDDLE: Air Quality Overview with Radial Meter & Dot Pollutants */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs text-slate-800 font-black tracking-wide uppercase font-orbitron">
              AIR QUALITY OVERVIEW
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
              ● CAMS LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-2">
            {/* Circular Ring Gauge */}
            <div className="sm:col-span-6 flex flex-col items-center justify-center text-center">
              <div 
                className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center p-2.5 transition-all border-4 border-slate-200 shadow-sm"
                style={{
                  background: `#f8fafc`,
                  borderColor: '#e2e8f0',
                }}
              >
                <span className="text-xs font-bold font-space text-slate-700">
                  {cat.category}
                </span>
                <span className="text-4xl font-black font-orbitron tracking-tight text-slate-900 my-0.5">
                  {current.usAqi}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  US EPA AQI
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 font-bold font-space">
                {current.usAqi <= 100 ? 'Acceptable air quality, stay active' : 'Elevated smog risk, protect lungs'}
              </p>
            </div>

            {/* 2-Column Pollutant Dot Matrix */}
            <div className="sm:col-span-6 grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs pl-2 sm:border-l sm:border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.pm10)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">PM10</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.ozone)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">O3</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.sulphur_dioxide)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">SO2</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.pm2_5)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">PM2.5</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.carbon_monoxide)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">CO</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 font-orbitron">{Math.round(current.nitrogen_dioxide)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">NO2</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
            <span>DRIVER: <strong className="text-emerald-700">{current.dominantPollutant}</strong></span>
            <span>WHO 24H: 15 µg/m³</span>
          </div>
        </div>

        {/* BOTTOM RIGHT: Chances of Rain Progress Bars (Cyber Green) */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs text-slate-800 font-black tracking-wide uppercase font-orbitron border-b border-slate-100 pb-2">
              PRECIPITATION RISK
            </h3>
          </div>

          <div className="space-y-2.5 my-auto py-2">
            {riskDays.map((d, idx) => {
              const pct = d.rainChance ?? 60;
              return (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="w-20 text-[11px] text-slate-700 font-bold truncate font-mono">
                    {d.dayName}
                  </span>
                  <div className="flex-1 mx-2 h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 pt-2 border-t border-slate-100">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCHER BAR: Full Map & AI */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-mono font-bold">
          <span className="text-emerald-700">● LIVE TELEMETRY: {location.name}, {location.country}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMap}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-sm font-orbitron"
          >
            <MapIcon className="w-4 h-4 text-emerald-400" />
            <span>🗺️ OPEN 100% VH LIVE MAP</span>
          </button>

          <button
            onClick={onOpenAi}
            className="px-4 py-2 rounded-xl bg-[#00ff87] hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono font-orbitron flex items-center gap-1.5 transition-all shadow-sm border border-emerald-400"
          >
            <Bot className="w-4 h-4" />
            <span>ASK VAYUMITRA AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
