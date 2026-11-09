import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  ShieldCheck,
  Sparkles,
  LayoutGrid,
  Map as MapIcon,
  Activity,
  HeartPulse,
  Radio,
  Bot
} from 'lucide-react';
import { AirQualityDataset, LocationInfo, SpikeAnomaly } from './types/aqi';
import { fetchAirQuality, PRESET_CITIES, reverseGeocode } from './services/airQualityApi';
import { detectPollutionSpikes } from './services/anomalyDetection';

// Components
import { Navbar } from './components/Navbar';
import { BentoDashboard } from './components/BentoDashboard';
import { AirQualityMap } from './components/AirQualityMap';
import { HistoricalTrends } from './components/HistoricalTrends';
import { AqiForecast } from './components/AqiForecast';
import { HealthAdvisorySuite } from './components/HealthAdvisorySuite';
import { LocationComparison } from './components/LocationComparison';
import { CleanAirFinder } from './components/CleanAirFinder';
import { PollutionLeaderboard } from './components/PollutionLeaderboard';
import { VayuMitraChat } from './components/VayuMitraChat';

export function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(PRESET_CITIES[1]); // Default: Mumbai
  const [dataset, setDataset] = useState<AirQualityDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'bento' | 'map' | 'analytics' | 'health'>('bento');

  // AI Chat Modal
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Load telemetry data from authentic API (Zero audio/beeps on load)
  const loadData = useCallback(async (loc: LocationInfo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAirQuality(loc);
      setDataset(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch authentic air quality telemetry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentLocation);
  }, [currentLocation, loadData]);

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const loc = await reverseGeocode(lat, lon);
          setCurrentLocation(loc);
        } catch {
          alert('Could not pinpoint location name. Falling back to default coordinates.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        alert('Location access denied. Please select your city from the search bar.');
      },
      { timeout: 10000 }
    );
  };

  const anomalies: SpikeAnomaly[] = dataset ? detectPollutionSpikes(dataset.historical) : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      {/* Main Container (DevInterio Responsive Container width: min(1400px, 92%)) */}
      <main className="flex-1 dev-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Navigation Mode Pill Tabs (Grid on Mobile, Flex on Tablet/Desktop) */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="w-full sm:w-auto p-1 sm:p-1.5 rounded-2xl bg-white border border-slate-200 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 shadow-sm font-mono text-xs">
            <button
              onClick={() => setActiveTab('bento')}
              className={`px-2.5 sm:px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all font-orbitron text-[11px] sm:text-xs ${
                activeTab === 'bento'
                  ? 'bg-[#00ff87] text-slate-950 border border-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">BENTO HUD</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-2.5 sm:px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all font-orbitron text-[11px] sm:text-xs ${
                activeTab === 'map'
                  ? 'bg-[#00ff87] text-slate-950 border border-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">LIVE MAP</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 sm:px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all font-orbitron text-[11px] sm:text-xs ${
                activeTab === 'analytics'
                  ? 'bg-[#00ff87] text-slate-950 border border-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">TRENDS</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`px-2.5 sm:px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all font-orbitron text-[11px] sm:text-xs ${
                activeTab === 'health'
                  ? 'bg-[#00ff87] text-slate-950 border border-emerald-400 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">ADVISORY</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-900 flex items-center justify-between text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
            <button
              onClick={() => loadData(currentLocation)}
              className="px-3 py-1 rounded-lg bg-rose-200 hover:bg-rose-300 font-mono text-xs font-bold text-slate-900 border border-rose-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !dataset && (
          <div className="space-y-6 animate-pulse">
            <div className="h-96 rounded-3xl bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-44 rounded-2xl bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]" />
              <div className="h-44 rounded-2xl bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]" />
              <div className="h-44 rounded-2xl bg-white border-2 border-slate-300 shadow-[2px_2px_0px_#cbd5e1]" />
            </div>
          </div>
        )}

        {/* Content Views */}
        {dataset && (
          <>
            {/* VIEW 1: BENTO DASHBOARD (Professional White & Green Maximalism - Map Removed) */}
            {activeTab === 'bento' && (
              <div className="space-y-6 animate-fadeIn">
                <BentoDashboard
                  dataset={dataset}
                  onSelectCity={setCurrentLocation}
                  onOpenMap={() => setActiveTab('map')}
                  onOpenAi={() => setIsAiChatOpen(true)}
                />

                {/* Clean Air Window */}
                <CleanAirFinder forecast={dataset.forecast} cityName={currentLocation.name} />

                {/* Multi-Location Comparison with dynamic search */}
                <LocationComparison
                  currentLocation={currentLocation}
                  currentAqi={dataset.current.usAqi}
                />
              </div>
            )}

            {/* VIEW 2: 100% VH FULL MAP VIEW */}
            {activeTab === 'map' && (
              <div className="space-y-6 animate-fadeIn">
                <AirQualityMap
                  currentLocation={currentLocation}
                  currentAqi={dataset.current.usAqi}
                  onSelectLocation={setCurrentLocation}
                  isFullView={true}
                />

                {/* National Leaderboard */}
                <PollutionLeaderboard onSelectCity={setCurrentLocation} />
              </div>
            )}

            {/* VIEW 3: HISTORICAL & FORECAST ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fadeIn">
                <HistoricalTrends
                  historical={dataset.historical}
                  anomalies={anomalies}
                />
                <AqiForecast forecast={dataset.forecast} />
              </div>
            )}

            {/* VIEW 4: CLINICAL HEALTH ADVISORY */}
            {activeTab === 'health' && (
              <div className="space-y-6 animate-fadeIn">
                <HealthAdvisorySuite current={dataset.current} />
                <LocationComparison
                  currentLocation={currentLocation}
                  currentAqi={dataset.current.usAqi}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Maximalist White & Green Footer */}
      <footer className="mt-16 border-t-2 border-slate-300 bg-white py-8">
        <div className="dev-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-base">🪔</span>
              <span className="font-black text-slate-900 font-orbitron tracking-tight">VAYUDRISHTI (वायु दृष्टि)</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#00ff87] text-slate-900 border border-slate-300">
                v2.2.0 • MAXIMALIST WHITE & GREEN
              </span>
            </div>
            <p className="text-xs text-slate-600 font-space font-medium">
              Built for <strong className="text-slate-900">Lets Code Diwali Challenge 2026</strong> • Theme: <em className="text-emerald-700 font-bold">Breathe Better</em>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-700 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Open-Meteo & MapTiler Telemetry
            </span>
            <span>•</span>
            <span className="text-slate-500">
              Live CAMS Atmospheric Model
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & StylistAI-inspired Copilot Drawer */}
      <VayuMitraChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        dataset={dataset || {
          location: currentLocation,
          current: {
            usAqi: 55,
            europeanAqi: 30,
            category: 'Moderate',
            categoryColor: '#f59e0b',
            categoryBg: 'bg-amber-500/10',
            dominantPollutant: 'PM2.5',
            pm2_5: 25,
            pm10: 55,
            nitrogen_dioxide: 10,
            sulphur_dioxide: 10,
            carbon_monoxide: 255,
            ozone: 57,
            timestamp: new Date().toISOString(),
            temperature: 27.4,
            humidity: 89,
            windSpeed: 36.7,
            visibility: 2.5,
            pressure: 1002,
            precipitation: 0.59,
            weatherCondition: 'Moderate rain',
            sunrise: '06:02 AM',
            sunset: '07:18 PM',
            uvIndex: 9,
            isForecast: false,
          },
          historical: [],
          forecast: [],
          dailyForecast: [],
          source: 'Open-Meteo & MapTiler',
          lastUpdated: 'Just now',
        }}
      />
    </div>
  );
}

export default App;
