import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Wind, 
  CloudRain, 
  Thermometer, 
  Compass,
  Maximize2,
  Minimize2,
  Search,
  RotateCcw,
  Eye,
  Activity,
  CheckCircle2,
  X,
  Radio,
  Play,
  Pause,
  Cloud,
  Droplets,
  Gauge,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { LocationInfo } from '../types/aqi';
import { fetchAllStationTelemetry, StationMapTelemetry, searchLocations } from '../services/airQualityApi';
import { getAqiCategory } from '../utils/aqiUtils';

interface AirQualityMapProps {
  currentLocation: LocationInfo;
  currentAqi: number;
  onSelectLocation: (loc: LocationInfo) => void;
  isFullView?: boolean;
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';
const WINDY_KEY = import.meta.env.VITE_WINDY_API_KEY || '';

export type WeatherLayer = 
  | 'temp' 
  | 'dewpoint' 
  | 'wind' 
  | 'cams' 
  | 'pm25' 
  | 'rain' 
  | 'clouds' 
  | 'pressure';

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  currentLocation,
  currentAqi,
  onSelectLocation,
  isFullView = false,
}) => {
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const leafletMapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.LayerGroup | null>(null);

  // Map Mode: 'windy-raster' (continuous weather field like MSN/Windy) vs 'maptiler-pins'
  const [mapEngine, setMapEngine] = useState<'windy-raster' | 'maptiler-pins'>('windy-raster');
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>('temp');
  const [windAnimationEnabled, setWindAnimationEnabled] = useState(true);
  const [pressureIsobars, setPressureIsobars] = useState(true);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [timelineStep, setTimelineStep] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-map search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Station Telemetry
  const [stations, setStations] = useState<StationMapTelemetry[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationMapTelemetry | null>(null);

  const cat = getAqiCategory(currentAqi);

  // Fetch station telemetry for sidebar and pins
  useEffect(() => {
    let mounted = true;
    fetchAllStationTelemetry().then((data) => {
      if (mounted) {
        setStations(data);
        const match = data.find((s) => s.name.includes(currentLocation.name) || currentLocation.name.includes(s.name));
        if (match) setSelectedStation(match);
      }
    });
    return () => {
      mounted = false;
    };
  }, [currentAqi, currentLocation.name]);

  // Handle Timeline Play/Pause Loop
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setTimelineStep((prev) => (prev + 1) % 5);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // Initialize Leaflet Map only if user switches to 'maptiler-pins'
  useEffect(() => {
    if (mapEngine !== 'maptiler-pins' || !leafletMapContainerRef.current) return;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(leafletMapContainerRef.current, {
        center: [currentLocation.latitude, currentLocation.longitude],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      const tileUrl = MAPTILER_KEY 
        ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        tileSize: MAPTILER_KEY ? 512 : 256,
        zoomOffset: MAPTILER_KEY ? -1 : 0,
      }).addTo(map);

      leafletMarkersRef.current = L.layerGroup().addTo(map);
      leafletMapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    } else {
      leafletMapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 6, {
        animate: true,
      });
      setTimeout(() => leafletMapInstanceRef.current?.invalidateSize(), 150);
    }
  }, [mapEngine, currentLocation]);

  // Render Leaflet Pins when in maptiler mode
  useEffect(() => {
    if (mapEngine !== 'maptiler-pins' || !leafletMarkersRef.current) return;
    leafletMarkersRef.current.clearLayers();

    stations.forEach((station) => {
      const isSelected = station.name === currentLocation.name;
      const c = getAqiCategory(station.aqi);
      const iconHtml = `
        <div style="
          background: #ffffff;
          border: 2px solid ${isSelected ? '#059669' : '#000000'};
          border-radius: 8px;
          padding: 4px 8px;
          box-shadow: ${isSelected ? '0 0 0 3px #00ff87, 3px 3px 0px #000' : '2px 2px 0px #000'};
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          gap: 2px;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <strong style="font-family: 'Orbitron', sans-serif; font-size: 11px;">${station.name.split(' ')[0]}</strong>
            <span style="background: ${c.color}; color: #fff; font-weight: 800; font-family: 'Orbitron', sans-serif; padding: 1px 5px; border-radius: 4px; font-size: 10px;">${station.aqi} AQI</span>
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #475569;">
            ${station.temperature}°C • PM2.5: ${station.pm2_5} • 💨 ${station.windSpeed}kph
          </div>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: 'telemetry-pin', iconSize: [140, 40] });
      const marker = L.marker([station.latitude, station.longitude], { icon });
      marker.on('click', () => {
        onSelectLocation({
          name: station.name,
          state: station.state,
          country: station.country,
          latitude: station.latitude,
          longitude: station.longitude,
        });
      });
      leafletMarkersRef.current?.addLayer(marker);
    });
  }, [mapEngine, stations, currentLocation, onSelectLocation]);

  // Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        onSelectLocation(results[0]);
        setSearchResults([]);
        setSearchQuery('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!outerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      outerWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Dynamic Windy URL with Selected Layer, Coordinates, and Animation
  const keyParam = WINDY_KEY ? `&key=${WINDY_KEY}` : '';
  const windyEmbedUrl = `https://embed.windy.com/embed.html?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&detailLat=${currentLocation.latitude}&detailLon=${currentLocation.longitude}&width=100%25&height=100%25&zoom=${isFullView ? 5 : 4}&level=surface&overlay=${activeLayer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=${pressureIsobars}&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1${keyParam}`;

  // Layer configuration definitions
  const LAYER_ITEMS: { id: WeatherLayer; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'temp', label: 'Temperature', icon: <Thermometer className="w-4 h-4" />, desc: 'Continuous surface thermal gradient' },
    { id: 'dewpoint', label: 'Dew Point', icon: <Droplets className="w-4 h-4" />, desc: 'Atmospheric dew point & condensation' },
    { id: 'wind', label: 'Wind Animation', icon: <Wind className="w-4 h-4" />, desc: 'Live moving particle streamlines' },
    { id: 'cams', label: 'Air Quality (CAMS)', icon: <Activity className="w-4 h-4" />, desc: 'Copernicus Atmospheric AQI & Ozone' },
    { id: 'pm25', label: 'PM2.5 Mass', icon: <Flame className="w-4 h-4" />, desc: 'Fine respirable particle density' },
    { id: 'rain', label: 'Rain & Radar', icon: <CloudRain className="w-4 h-4" />, desc: 'Precipitation radar & accumulation' },
    { id: 'clouds', label: 'Cloud Cover', icon: <Cloud className="w-4 h-4" />, desc: 'Satellite visible & infrared clouds' },
    { id: 'pressure', label: 'Pressure & Isobars', icon: <Gauge className="w-4 h-4" />, desc: 'Sea level barometric isobars' },
  ];

  // Dynamic Legend Scale based on active layer
  const renderLegendScale = () => {
    switch (activeLayer) {
      case 'temp':
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">-40°C</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-blue-700 via-cyan-400 via-green-400 via-yellow-400 via-orange-500 to-red-600" />
            <span className="text-[9px] sm:text-[10px] font-bold">+45°C</span>
          </div>
        );
      case 'dewpoint':
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">-20°C</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-indigo-700 via-teal-400 via-emerald-400 to-amber-500" />
            <span className="text-[9px] sm:text-[10px] font-bold">+30°C</span>
          </div>
        );
      case 'wind':
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">0 km/h</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-cyan-200 via-blue-500 via-purple-600 to-rose-600" />
            <span className="text-[9px] sm:text-[10px] font-bold">120+</span>
          </div>
        );
      case 'cams':
      case 'pm25':
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">0 Good</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 via-rose-600 to-red-950" />
            <span className="text-[9px] sm:text-[10px] font-bold">350+</span>
          </div>
        );
      case 'rain':
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">0 mm</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-slate-200 via-blue-400 via-indigo-600 via-purple-600 to-pink-600" />
            <span className="text-[9px] sm:text-[10px] font-bold">50+</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[9px] sm:text-[10px] font-bold">Low</span>
            <div className="w-24 xs:w-36 sm:w-56 h-2.5 sm:h-3 rounded-full border border-black bg-gradient-to-r from-slate-300 via-blue-500 to-amber-500" />
            <span className="text-[9px] sm:text-[10px] font-bold">High</span>
          </div>
        );
    }
  };

  return (
    <div 
      ref={outerWrapperRef}
      className={`w-full rounded-3xl bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1] overflow-hidden relative flex flex-col ${
        isFullscreen ? 'h-screen w-screen rounded-none border-0' : isFullView ? 'h-[calc(100vh-140px)] min-h-[760px]' : 'h-[650px]'
      }`}
    >
      {/* 1. TOP DOCK BAR (Matching your MSN Weather / Windy reference) */}
      <div className="p-2 sm:p-3 bg-white border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-2.5 z-20 relative">
        {/* Layer Icon Dock */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 max-w-full">
          {LAYER_ITEMS.map((item) => {
            const isActive = activeLayer === item.id && mapEngine === 'windy-raster';
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveLayer(item.id);
                  setMapEngine('windy-raster');
                }}
                title={item.desc}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border-2 border-slate-300 shrink-0 ${
                  isActive
                    ? 'bg-[#00ff87] text-slate-900 shadow-[2px_2px_0px_#cbd5e1] scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Engine Switcher */}
          <button
            onClick={() => setMapEngine(mapEngine === 'windy-raster' ? 'maptiler-pins' : 'windy-raster')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border-2 border-slate-300 shrink-0 ml-1 ${
              mapEngine === 'maptiler-pins'
                ? 'bg-[#00ff87] text-slate-900 shadow-[2px_2px_0px_#cbd5e1]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MapTiler Pins</span>
          </button>
        </div>

        {/* Right Search & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          {/* In-Map Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search map location..."
              className="pl-8 pr-3 py-1.5 rounded-xl border-2 border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-500 w-36 sm:w-52 shadow-inner"
            />
          </form>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter 100% Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAP CANVAS CONTAINER */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-900">
        {/* ENGINE A: WINDY CONTINUOUS METEOROLOGICAL RASTER FIELD */}
        {mapEngine === 'windy-raster' ? (
          <iframe
            key={`${currentLocation.latitude}-${currentLocation.longitude}-${activeLayer}-${pressureIsobars}`}
            src={windyEmbedUrl}
            title="Windy Continuous Meteorological & AQI Map Engine"
            className="w-full h-full border-0"
            allow="geolocation"
          />
        ) : (
          /* ENGINE B: LEAFLET MAPTILER PINS ENGINE */
          <div ref={leafletMapContainerRef} className="w-full h-full z-0 relative bg-white" />
        )}

        {/* 3. LEFT FLOATING HUD CARD: "Today's Recommendations" (Exact match to your screenshot!) */}
        <div 
          className={`absolute top-4 left-4 z-20 transition-all duration-300 font-mono text-xs w-[calc(100%-2rem)] sm:w-72 max-w-xs ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'
          }`}
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-2xl shadow-xl p-3.5 sm:p-4 space-y-3 sm:space-y-3.5 relative w-full">
            {/* Toggle collapse button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-white text-slate-800 border border-slate-300 flex items-center justify-center font-bold shadow-sm hover:bg-[#00ff87] hover:text-slate-950"
              title="Collapse Panel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* City & Temperature Header */}
            <div className="border-b border-slate-700 pb-3">
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span className="font-bold font-space truncate">{currentLocation.name}</span>
                <span className="text-[10px] text-slate-400">Live Telemetry</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-3xl font-black font-orbitron text-white">
                  {selectedStation?.temperature ?? 28}°<span className="text-sm font-normal text-slate-400">C</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-orbitron text-[#00ff87]">
                    {selectedStation?.condition ?? 'Clear / Hazy'}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: cat.color }}>
                    {currentAqi} AQI • {cat.category}
                  </div>
                </div>
              </div>
            </div>

            {/* "Today's Recommendations" Section */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-orbitron">
                Today's Recommendations
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Umbrella Recommendation */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <CloudRain className="w-3 h-3 text-cyan-400" />
                    <span>Umbrella</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold mt-1 text-white">
                    <span className={`w-2 h-2 rounded-full ${selectedStation && selectedStation.precipitation > 1 ? 'bg-amber-400 animate-ping' : 'bg-[#00ff87]'}`} />
                    <span>{selectedStation && selectedStation.precipitation > 1 ? 'Carry' : 'No need'}</span>
                  </div>
                </div>

                {/* Outdoors Recommendation */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>Outdoors</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold mt-1" style={{ color: cat.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{currentAqi > 200 ? 'Hazardous' : currentAqi > 100 ? 'Poor' : 'Safe'}</span>
                  </div>
                </div>

                {/* Clothing Recommendation */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Clothing Advisory</div>
                      <div className="text-white font-bold">
                        {(selectedStation?.temperature ?? 28) > 25 ? 'Light cottons & sunglasses' : 'Warm jacket required'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-[#00ff87] border border-slate-700">
                    N95 Mask {currentAqi > 150 ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Active Parameter Pill */}
            <div className="p-2.5 rounded-xl bg-black border border-slate-800 text-[10px] space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Active Continuous Layer:</span>
                <span className="text-[#00ff87] font-bold uppercase">{activeLayer}</span>
              </div>
              <div className="text-slate-300">
                Continuous ECMWF/GFS atmospheric field with particle stream vectors.
              </div>
            </div>
          </div>
        </div>

        {/* Collapsed state opener button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 px-3 py-2 rounded-xl bg-slate-900 text-[#00ff87] border border-slate-700 shadow-lg flex items-center gap-1.5 font-mono text-xs font-bold hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
            <span>Show Recommendations</span>
          </button>
        )}

        {/* 4. BOTTOM CONTROLS & TIMELINE HUD (Matching your screenshot) */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pointer-events-none">
          {/* Left Controls: Wind Animation Toggle & Timeline Playback */}
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-2 sm:p-2.5 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs">
            {/* Wind Animation Checkbox (From your screenshot) */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200 hover:text-white select-none">
              <input
                type="checkbox"
                checked={windAnimationEnabled}
                onChange={(e) => {
                  setWindAnimationEnabled(e.target.checked);
                  if (e.target.checked) setActiveLayer('wind');
                }}
                className="w-4 h-4 rounded text-[#00ff87] focus:ring-[#00ff87] accent-[#00ff87]"
              />
              <span>☑ Wind Animation</span>
            </label>

            <span className="text-slate-600">|</span>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="p-1.5 rounded-xl bg-[#00ff87] text-slate-950 font-bold border border-emerald-400 hover:bg-emerald-400 transition-all flex items-center gap-1 text-[11px]"
            >
              {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingTimeline ? 'PAUSE' : 'PLAY'}</span>
            </button>

            {/* Timeline progression indicators */}
            <div className="flex items-center gap-1 text-[11px]">
              {(['NOW', '+3h', '+6h', '+12h', '+24h'] as const).map((step, idx) => (
                <button
                  key={step}
                  onClick={() => setTimelineStep(idx)}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    timelineStep === idx 
                      ? 'bg-white text-black font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: Dynamic Color Gradient Scale Bar (From your screenshot) */}
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-2 font-mono">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-orbitron mr-1">Scale:</span>
            {renderLegendScale()}
          </div>
        </div>
      </div>
    </div>
  );
};
