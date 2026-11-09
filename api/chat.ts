export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, data } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const current = data?.current || {};
    const location = data?.location || {};

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              text: `You are "VayuMitra", an empathetic, highly knowledgeable clean air health and environmental intelligence copilot for Diwali 2026.
Current station: ${location.name || 'Current Location'}, ${location.country || 'India'}.
Live US EPA AQI: ${current.usAqi || 50} (${current.category || 'Moderate'}).
Dominant Pollutant: ${current.dominantPollutant || 'PM2.5'} (PM2.5: ${current.pm2_5 || 25} µg/m³, PM10: ${current.pm10 || 50} µg/m³).
Weather: Temperature ${current.temperature || 25}°C, Wind ${current.windSpeed || 10} km/h, Rainfall ${current.precipitation || 0} mm, Humidity ${current.humidity || 50}%.

User Query: "${prompt}"

Provide a concise, practical, clinically grounded response in under 110 words with crisp bullet points or clear actionable steps. If discussing Diwali, suggest eco-friendly clay diyas and lung protection.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: 'Gemini upstream error', details: errText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const json = await response.json();
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ reply: reply || '' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
