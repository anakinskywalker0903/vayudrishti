import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'dev-api-chat-middleware',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method Not Allowed' }))
              return
            }

            let body = ''
            req.on('data', chunk => {
              body += chunk
            })

            req.on('end', async () => {
              try {
                const { prompt, data } = JSON.parse(body || '{}')
                const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY

                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'No GEMINI_API_KEY found in .env' }))
                  return
                }

                const current = data?.current || {}
                const location = data?.location || {}

                const upstream = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
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
                    }),
                  }
                )

                if (!upstream.ok) {
                  const errText = await upstream.text()
                  res.statusCode = upstream.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: errText }))
                  return
                }

                const json = (await upstream.json()) as any
                const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ reply }))
              } catch (err: any) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message }))
              }
            })
          })
        },
      },
    ],
  }
})
