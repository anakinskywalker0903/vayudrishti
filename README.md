# 🪔 VayuDrishti (वायु दृष्टि)
### *Real-Time Air Quality Intelligence & Diwali Smog Advisory Platform*

> **Built for Lets Code Diwali Challenge 2026**  
> **Theme:** Breathe Better — Technology for Cleaner Air  
> **Developer:** Rohit Dubey ([@anakinskywalker0903](https://github.com/anakinskywalker0903))  
> **Repository:** [https://github.com/anakinskywalker0903/letcodediwali](https://github.com/anakinskywalker0903/letcodediwali)  
> **Live Demo:** Deployed on Vercel 

---

## 🌟 Executive Summary
During the festival of Diwali and winter crop burning periods across India and South Asia, particulate pollution ($\text{PM}_{2.5}$ and $\text{PM}_{10}$) spikes to emergency levels (often exceeding $400+$ AQI). Citizens frequently lack actionable, hyper-local, and scientifically grounded guidance on when it is safe to exercise, whether windows should be opened or shut, and how to protect vulnerable children and seniors.

**VayuDrishti (वायु दृष्टि)** is a high-craft, real-time Air Quality Intelligence platform that transforms complex atmospheric data from authentic global and regional monitoring networks into instant, life-saving insights.

Built following the **Frontend-Tech-Library** architecture and **Impeccable Design Standards** (anti-UI slop, intentional atmospheric typography, and fluid micro-interactions).

---

## 🚀 Key Features Matrix

### 📋 Mandatory Features Implemented (100% Complete)
| Mandatory Feature | Implementation in VayuDrishti |
| :--- | :--- |
| **A. Live AQI Dashboard** | Real-time US EPA & Indian NAAQS AQI, dynamic dial gauge, 6 core pollutants ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$), severity categories, atmospheric dispersion factors (temp, humidity, wind), and live sync timestamps. |
| **B. Interactive Air Quality Map** | Dynamic Leaflet map with color-coded pins, station popups, one-click switching, and regional density heatmap toggle. |
| **C. Historical Pollution Tracker** | Multi-range (24h, 48h, 72h) time-series analysis comparing $\text{PM}_{2.5}$ vs $\text{PM}_{10}$ vs gases, with 24h percentage deltas and automated spike detection. |
| **D. Location Comparison** | Side-by-side comparison of 2 to 4 cities with difference metrics and clean air winner benchmark. |
| **E. Health & Safety Dashboard** | Evidence-based clinical recommendations for outdoor cardio, N95 respirators, home ventilation, children/elderly care, and a dedicated Diwali Smog Defense Guide. |
| **F. 72-Hour AQI Forecast** | Hourly atmospheric forecast projection distinguishing predictive modeling from live observations with peak inversion hazard warnings. |

### 🎁 Bonus Features Implemented (All 13 Categories Covered)
1. 🤖 **AI AQI Assistant (VayuMitra):** Interactive conversational agent explaining readings and giving tailored health guidance.
2. 🔔 **Smart AQI Alerts:** User-customizable AQI threshold sliders with synthesized acoustic chime and desktop push notifications.
3. ⚡ **ML & Statistical Anomaly Detection:** Rolling Z-score spike detector pinpointing firecracker episodes and biomass surges.
4. 🗺️ **Pollution Heatmap:** Toggleable atmospheric dispersion overlay on Leaflet.
5. 📍 **GPS One-Click Auto-Detection:** Browser Geolocation API + OpenStreetMap Nominatim reverse geocoding.
6. 🧭 **Diurnal Clean Air Window Finder:** Identifies the safest midday hours to ventilate and exercise vs nocturnal inversion danger windows.
7. 🪔 **Social Media AQI Cards:** HTML5 Canvas card generator exporting high-res branded graphics for WhatsApp, Instagram, and LinkedIn.
8. 📄 **Automated Audit Impact Report:** Printable / PDF-ready clinical air quality audit report.
9. 🏆 **Pollution Leaderboard:** Live ranking of cleanest vs most polluted monitored locations.
10. 🎙️ **Voice Health Briefing:** Web Speech API text-to-speech accessible audio broadcasts.
11. 🔍 **Spike Analysis Engine:** Correlates $\text{SO}_2$ and $\text{PM}_{2.5}$ to detect pyrotechnic combustion signatures.
12. 🌐 **Multi-API Fallback Architecture:** Open-Meteo + Copernicus CAMS + OpenStreetMap + optional Gemini & WAQI.
13. 💡 **AI Natural Language Insights:** Auto-summaries of current trends and risk vectors.

---

## 📡 Authentic Public APIs Integrated

In strict adherence to **Section 2 (API Integration - Mandatory)**, all data is fetched live from authentic public scientific repositories with zero fabricated or hardcoded measurements:

1. **Open-Meteo Air Quality & Atmospheric API**
   - **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`
   - **Data Provided:** Hourly real-time, 72h historical, and 5-day hourly forecast for $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$, European AQI, and US EPA AQI.
   - **Scientific Backing:** Copernicus Atmospheric Monitoring Service (CAMS) and NOAA GFS.
   - **Authentication:** Public authentic endpoint (no key barrier).

2. **Open-Meteo Weather API**
   - **Endpoint:** `https://api.open-meteo.com/v1/forecast`
   - **Data Provided:** Ground temperature, relative humidity, and 10m wind speed for dispersion velocity calculations.

3. **OpenStreetMap Nominatim API**
   - **Endpoint:** `https://nominatim.openstreetmap.org/search` & `reverse`
   - **Data Provided:** Global city search, district matching, and GPS reverse geocoding.

4. **Google Gemini Flash API** *(Optional Enhancement)*
   - Dynamic LLM grounding for the VayuMitra conversational copilot.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS + custom Impeccable atmospheric tokens
- **3D Atmospheric Engine:** Three.js (WebGL volumetric particle dome reacting to live AQI + simulated pyrotechnic explosions)
- **Rigid-Body Physics Lab:** Matter.js (2D particulate respiratory filtration physics: N95 vs cloth mask vs unmasked)
- **Data Visualization:** Recharts (responsive time-series charts)
- **Interactive Mapping:** Leaflet + CartoDB Dark Matter tiles
- **Audio & Speech:** Web Speech API & Web Audio API
- **Graphic Generation:** HTML5 Canvas API
- **Celebration & UX:** Canvas Confetti

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Steps
```bash
# 1. Clone repository
git clone https://github.com/anakinskywalker0903/letcodediwali.git
cd letcodediwali

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
cp .env.example .env

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 🪔 Diwali Message: Breathe Better, Build Smarter
Air pollution is not just a seasonal metric; it is an acute public health issue affecting millions. This Diwali, let's celebrate light, hope, and compassion by choosing cleaner skies and using technology to protect our loved ones. 

Happy Diwali! 🪔✨
