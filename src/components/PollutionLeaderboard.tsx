import React, { useEffect, useState } from 'react';
import { Award, Flame, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { CityRanking, LocationInfo } from '../types/aqi';
import { fetchLeaderboard, PRESET_CITIES } from '../services/airQualityApi';
import { getAqiCategory } from '../utils/aqiUtils';

interface PollutionLeaderboardProps {
  onSelectCity: (loc: LocationInfo) => void;
}

export const PollutionLeaderboard: React.FC<PollutionLeaderboardProps> = ({ onSelectCity }) => {
  const [data, setData] = useState<{ cleanest: CityRanking[]; mostPolluted: CityRanking[] }>({
    cleanest: [],
    mostPolluted: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLeaderboard().then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCityClick = (ranking: CityRanking) => {
    const found = PRESET_CITIES.find(c => c.name === ranking.name) || {
      name: ranking.name,
      country: ranking.country,
      latitude: ranking.latitude,
      longitude: ranking.longitude,
    };
    onSelectCity(found);
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-slate-300 p-4 sm:p-6 shadow-[2px_2px_0px_#cbd5e1] space-y-5 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00ff87] border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]">
              <Award className="w-4 h-4 text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-orbitron uppercase">
              National & Global Air Quality Leaderboard
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Live rankings synthesized across monitored urban centers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Polluted Hotspots */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
            <Flame className="w-4 h-4 text-rose-600" />
            HIGHEST POLLUTION HOTSPOTS
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-xs text-slate-500 font-mono py-4 text-center font-bold">Loading authentic rankings...</div>
            ) : (
              data.mostPolluted.map((city, idx) => {
                const cat = getAqiCategory(city.aqi);
                return (
                  <button
                    key={city.name}
                    onClick={() => handleCityClick(city)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#00ff87] border-2 border-slate-300 flex items-center justify-between group transition-all shadow-[2px_2px_0px_#cbd5e1]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-900 border border-slate-300 font-mono text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="text-left">
                        <div className="text-sm font-black text-slate-900 font-orbitron">
                          {city.name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono font-bold">
                          PM2.5: {city.pm2_5} µg/m³
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black font-orbitron" style={{ color: cat.color }}>
                        {city.aqi} AQI
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Cleanest Locations */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 font-orbitron">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            CLEANEST AIR BENCHMARKS
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-xs text-slate-500 font-mono py-4 text-center font-bold">Loading authentic rankings...</div>
            ) : (
              data.cleanest.map((city, idx) => {
                const cat = getAqiCategory(city.aqi);
                return (
                  <button
                    key={city.name}
                    onClick={() => handleCityClick(city)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#00ff87] border-2 border-slate-300 flex items-center justify-between group transition-all shadow-[2px_2px_0px_#cbd5e1]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#00ff87] text-slate-900 border border-slate-300 font-mono text-xs font-black flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div className="text-left">
                        <div className="text-sm font-black text-slate-900 font-orbitron">
                          {city.name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono font-bold">
                          PM2.5: {city.pm2_5} µg/m³
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black font-orbitron text-emerald-700">
                        {city.aqi} AQI
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
