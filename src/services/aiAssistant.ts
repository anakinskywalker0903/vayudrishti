import { AirQualityDataset } from '../types/aqi';

export async function askVayuMitra(
  prompt: string,
  data: AirQualityDataset,
  userGeminiKey?: string
): Promise<string> {
  const current = data.current;
  const location = data.location;

  // 1. Secure Server-Side Proxy Endpoint (/api/chat)
  // Keeps Gemini API key hidden on Vercel/server without exposing it in the client bundle
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, data }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.reply && json.reply.trim()) {
        return json.reply.trim();
      }
    }
  } catch {
    // Continue to direct user key or fallback
  }

  // 1b. Direct user-provided key (if explicitly supplied)
  if (userGeminiKey && userGeminiKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userGeminiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are "VayuMitra", an empathetic, highly knowledgeable clean air health and environmental intelligence copilot for Diwali 2026.
Current station: ${location.name}, ${location.country}.
Live US EPA AQI: ${current.usAqi} (${current.category}).
Dominant Pollutant: ${current.dominantPollutant} (PM2.5: ${current.pm2_5} µg/m³, PM10: ${current.pm10} µg/m³).
Weather: Temperature ${current.temperature}°C, Wind ${current.windSpeed} km/h, Rainfall ${current.precipitation} mm, Humidity ${current.humidity}%.

User Query: "${prompt}"

Provide a concise, practical, clinically grounded response in under 110 words with crisp bullet points or clear actionable steps. If discussing Diwali, suggest eco-friendly clay diyas and lung protection.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) return reply.trim();
      }
    } catch {
      // Continue to free cloud fallback
    }
  }

  // 2. Free Cloud Fallback Model (Pollinations text endpoint)
  try {
    const systemPrompt = `You are VayuMitra clean air assistant. Current station: ${location.name}. AQI: ${current.usAqi} (${current.category}), PM2.5: ${current.pm2_5} µg/m³. Provide concise health-focused advice under 90 words.`;
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(systemPrompt)}&model=openai`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10 && !text.includes('<!DOCTYPE')) {
        return text.trim();
      }
    }
  } catch {
    // Continue to local engine
  }

  // 3. Grounded Local Intelligence Engine
  const q = prompt.toLowerCase();

  if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk') || q.includes('workout')) {
    if (current.usAqi > 150) {
      return `⚠️ Running outdoors in ${location.name} right now is hazardous. With an AQI of ${current.usAqi} and PM2.5 at ${current.pm2_5} µg/m³, vigorous exercise pulls toxic particulate deep into your alveoli. Please switch to an indoor workout or gym with HEPA air filtration.`;
    } else if (current.usAqi > 100) {
      return `⚠️ Outdoor cardio should be dialed down today in ${location.name} (AQI ${current.usAqi}). If you must run, do so between 12 PM - 3:30 PM when daytime solar convection dilutes surface particulates, and keep intensity light.`;
    } else {
      return `✅ Great news! Current AQI in ${location.name} is ${current.usAqi} (${current.category}). Outdoor running and workouts are safe. Enjoy the fresh air!`;
    }
  }

  if (q.includes('diwali') || q.includes('firecracker') || q.includes('cracker') || q.includes('smog') || q.includes('patakha')) {
    return `🪔 Diwali Smog Advisory for ${location.name}: Firecracker combustion releases concentrated barium, strontium, and dense PM2.5. If air quality is ${current.category} (${current.usAqi} AQI), keep doors sealed after 7 PM, operate HEPA air purifiers, stay hydrated with warm fluids, and celebrate with traditional earthen diyas and eco-lights!`;
  }

  if (q.includes('mask') || q.includes('n95') || q.includes('cloth')) {
    if (current.usAqi > 120) {
      return `😷 Strongly Recommended: A fitted N95 or KN95 respirator is essential today in ${location.name}. Simple cloth or surgical masks do NOT filter microscopic PM2.5 particles (${current.pm2_5} µg/m³). Ensure an airtight nose bridge seal.`;
    } else {
      return `Current AQI in ${location.name} is ${current.usAqi}. A mask is not strictly required for healthy adults today, though sensitive individuals should carry one during evening traffic hours.`;
    }
  }

  return `🤖 VayuMitra Telemetry Analysis for ${location.name}: Current AQI is ${current.usAqi} (${current.category}), driven by ${current.dominantPollutant} at ${current.pm2_5} µg/m³ with temperature at ${current.temperature}°C. Feel free to ask about outdoor workouts, mask guidelines, Diwali precautions, or indoor ventilation!`;
}
