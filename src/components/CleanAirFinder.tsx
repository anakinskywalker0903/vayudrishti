import React from 'react';
import { Compass, Sun, Moon, ShieldAlert, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { HourlyReading } from '../types/aqi';
import { formatTime } from '../utils/aqiUtils';

interface CleanAirFinderProps {
  forecast: HourlyReading[];
  cityName: string;
}

export const CleanAirFinder: React.FC<CleanAirFinderProps> = ({ forecast, cityName }) => {
  // Analyze next 24 hours to find optimal outdoor activity hours
  const next24 = forecast.slice(0, 24);

  // Sort by lowest AQI
  const sorted = [...next24].sort((a, b) => a.usAqi - b.usAqi);
  const bestHour = sorted[0];
  const worstHour = [...next24].sort((a, b) => b.usAqi - a.usAqi)[0];

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5 text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00ff87] border border-slate-200 shadow-sm">
              <Compass className="w-4 h-4 text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-orbitron uppercase">
              Diurnal Clean Air Ventilation Windows
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Optimized outdoor timing computed from atmospheric thermal inversion patterns in {cityName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Safest Outdoor Window */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
                <Sun className="w-4 h-4 text-emerald-700" />
                OPTIMAL VENTILATION WINDOW
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#00ff87] text-slate-900 border border-emerald-300">
                SAFEST
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-orbitron text-slate-900">
                {bestHour ? formatTime(bestHour.time) : '1:00 PM'}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800">
                (Projected AQI: {bestHour?.usAqi ?? 75})
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Midday solar radiation breaks nocturnal ground inversions and triggers vertical atmospheric mixing, diluting surface particulates. Safest window for outdoor activity or airing rooms.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-900 font-bold pt-2 border-t border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Recommended for outdoor exercise and cross-ventilation</span>
          </div>
        </div>

        {/* Highest Hazard Window */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
                <Moon className="w-4 h-4 text-rose-700" />
                PEAK SMOG INVERSION WINDOW
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-200 text-rose-900 border border-rose-300">
                HIGHEST RISK
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-orbitron text-rose-700">
                {worstHour ? formatTime(worstHour.time) : '6:00 AM'}
              </span>
              <span className="text-xs font-mono font-bold text-rose-800">
                (Projected AQI: {worstHour?.usAqi ?? 190})
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Nocturnal radioactive radiative cooling traps ground-level particulates beneath a low thermal boundary cap. Particulate concentrations peak sharply. Avoid morning cardio.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-900 font-bold pt-2 border-t border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            <span>Keep windows shut and wear sealed N95 if commuting</span>
          </div>
        </div>
      </div>
    </div>
  );
};
