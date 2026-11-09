import React from 'react';
import { 
  HeartPulse, 
  Wind, 
  Home, 
  Baby, 
  Activity, 
  AlertOctagon, 
  Sparkles, 
  Droplet, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CurrentAirQuality } from '../types/aqi';
import { getAqiCategory } from '../utils/aqiUtils';

interface HealthAdvisorySuiteProps {
  current: CurrentAirQuality;
}

export const HealthAdvisorySuite: React.FC<HealthAdvisorySuiteProps> = ({ current }) => {
  const cat = getAqiCategory(current.usAqi);

  const activities = [
    {
      title: 'Outdoor Running & Cardio',
      icon: Activity,
      status: current.usAqi <= 100 ? 'Safe' : current.usAqi <= 150 ? 'Caution' : 'Avoid',
      badgeClass: current.usAqi <= 100 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : current.usAqi <= 150 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-rose-100 text-rose-900 border-rose-400',
      advice: current.usAqi <= 100 
        ? 'Optimal conditions for running and cardio.' 
        : current.usAqi <= 150 
        ? 'Reduce duration and intensity; avoid running along major highways.' 
        : 'Do NOT run outdoors. High minute-ventilation draws fine particulates into deep bronchi.',
    },
    {
      title: 'Protective Mask (N95 / FFP2)',
      icon: AlertOctagon,
      status: current.usAqi <= 100 ? 'Not Needed' : current.usAqi <= 150 ? 'Recommended' : 'Mandatory',
      badgeClass: current.usAqi <= 100 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : current.usAqi <= 150 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-rose-100 text-rose-900 border-rose-400',
      advice: current.usAqi <= 100 
        ? 'Ambient air is within acceptable respiratory thresholds.' 
        : current.usAqi <= 150 
        ? 'N95 respirator advised for commuters and vulnerable individuals.' 
        : 'Wear a sealed N95/FFP2 respirator. Cloth masks fail to trap sub-2.5 micron particles.',
    },
    {
      title: 'Home Ventilation & Windows',
      icon: Home,
      status: current.usAqi <= 100 ? 'Open Windows' : current.usAqi <= 150 ? 'Close in Rush Hours' : 'Keep Closed',
      badgeClass: current.usAqi <= 100 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : current.usAqi <= 150 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-rose-100 text-rose-900 border-rose-400',
      advice: current.usAqi <= 100 
        ? 'Open windows freely for cross-ventilation.' 
        : current.usAqi <= 150 
        ? 'Keep windows shut during early mornings and rush hour peaks.' 
        : 'Keep doors and windows sealed. Operate indoor True-HEPA purifiers.',
    },
    {
      title: 'Children & Senior Citizens',
      icon: Baby,
      status: current.usAqi <= 80 ? 'Safe' : current.usAqi <= 150 ? 'Limit Play' : 'Keep Indoors',
      badgeClass: current.usAqi <= 80 ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : current.usAqi <= 150 ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-rose-100 text-rose-900 border-rose-400',
      advice: current.usAqi <= 80 
        ? 'Safe for normal outdoor recreation.' 
        : current.usAqi <= 150 
        ? 'Keep outdoor play sessions under 30 minutes.' 
        : 'Strict indoor confinement. Children breathe faster and absorb higher toxic loads per body mass.',
    },
  ];

  const clinicalTips = [
    { title: 'Airway Hydration Protocol', desc: 'Drink 2.5 - 3L of water daily. Warm fluids and steam inhalations help clear trapped particulate matter from mucosal linings.' },
    { title: 'Indoor HEPA Air Plants', desc: 'Place Areca Palm, Snake Plant (Sansevieria), or Spider Plant in bedrooms to assist indoor VOC clearance.' },
    { title: 'Asthma Rescue Preparedness', desc: 'Ensure that salbutamol / budesonide inhalers are unexpired and kept within immediate reach during smog peaks.' },
    { title: 'Nocturnal Smog Inversion', desc: 'Smog settles lowest between 11 PM and 7 AM due to thermal radiation inversion. Avoid opening balconies during this window.' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00ff87] border border-slate-200 shadow-sm">
              <HeartPulse className="w-4 h-4 text-slate-900" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-orbitron uppercase">
              Clinical Health & Safety Advisory
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Evidence-based medical guidance calibrated to current AQI ({current.usAqi} - {cat.category})
          </p>
        </div>
      </div>

      {/* Activity Advisory Grid (DevInterio Responsive 1-col on mobile, 2-col tablet, 4-col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {activities.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <Icon className="w-4 h-4 text-slate-800" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${act.badgeClass}`}>
                    {act.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 font-orbitron mt-3">
                  {act.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {act.advice}
              </p>
            </div>
          );
        })}
      </div>

      {/* Clinical Smog Defense Checklist */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-800" />
          <h3 className="font-black text-xs sm:text-sm text-slate-900 tracking-wide uppercase font-orbitron">
            Physiological Smog Defense Protocol
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {clinicalTips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold font-sans">{tip.title}: </strong>
                <span className="text-slate-600 font-sans">{tip.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
