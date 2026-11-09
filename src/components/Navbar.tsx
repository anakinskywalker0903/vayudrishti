import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Bot,
  Compass
} from 'lucide-react';
import { LocationInfo } from '../types/aqi';
import { PRESET_CITIES, searchLocations } from '../services/airQualityApi';

interface NavbarProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  onOpenAiChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  onDetectLocation,
  isDetectingLocation,
  onOpenAiChat,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const found = await searchLocations(query);
        setResults(found);
        setIsOpen(true);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm font-sans">
      <div className="dev-container h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#00ff87] text-slate-900 border border-slate-200 shadow-sm">
            <Compass className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-orbitron">
                VayuDrishti
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#00ff87] text-slate-900 border border-emerald-300 hidden sm:inline-block">
                वायु दृष्टि
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden md:block">
              Real-Time Air Quality & Meteorological Intelligence
            </p>
          </div>
        </div>

        {/* Search Bar & Location Switcher */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= 2 || results.length > 0) setIsOpen(true);
              }}
              placeholder="Search city, district, or pin (e.g. 466114)..."
              className="w-full pl-8 sm:pl-9 pr-14 sm:pr-20 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 shadow-sm transition-all font-space"
            />
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              title="Detect current location"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] sm:text-xs font-bold text-slate-900 bg-[#00ff87] hover:bg-emerald-400 rounded-lg flex items-center gap-1 transition-colors border border-emerald-300 shadow-sm"
            >
              <MapPin className={`w-3 h-3 ${isDetectingLocation ? 'animate-bounce' : ''}`} />
              <span className="hidden xs:inline sm:inline">GPS</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto font-mono">
              <div className="p-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="font-bold text-slate-900 font-orbitron">SEARCH RESULTS</span>
                <span className="text-[10px]">OSM & CAMS</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(results.length > 0 ? results : PRESET_CITIES.slice(0, 6)).map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    onClick={() => {
                      onSelectLocation(item);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5 font-space">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono pl-5">
                        {[item.state, item.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    {item.name === currentLocation.name && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00ff87] text-slate-900 border border-emerald-300">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: AI Copilot ONLY */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAiChat}
            title="Open VayuMitra AI Assistant"
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#00ff87] border border-slate-700 shadow-sm text-xs font-bold font-orbitron flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-4 h-4 text-[#00ff87]" />
            <span className="hidden sm:inline">AI COPILOT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
