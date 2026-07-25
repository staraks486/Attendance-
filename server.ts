import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Weekly Report Analysis Endpoint
  app.post('/api/generate-ai-report', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is missing. Please configure it in environment variables.',
        });
      }

      const { recordsSummary, departmentData, timeframe } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are an expert HR & Operations Workforce Analyst for "GeoClock India Edition".
Analyze the following employee attendance data for Indian enterprise hubs (Bengaluru, Mumbai BKC, Gurgaon Cyber City, Hyderabad HITECH City) for period: ${timeframe || 'This Week'}.

Data Summary:
- Total Attendance Logs Analyzed: ${recordsSummary.totalRecords || 0}
- Average Hours per Employee: ${recordsSummary.avgHours || 0} hrs
- On-Time Attendance Rate: ${recordsSummary.onTimeRate || 0}%
- Geofence Compliance Rate: ${recordsSummary.geofenceRate || 0}%
- Total Overtime Hours: ${recordsSummary.overtimeHours || 0} hrs
- Anomaly Count (Late Arrivals / Offsite Remote Clock-ins): ${recordsSummary.anomalyCount || 0}

Department Breakdown:
${JSON.stringify(departmentData || [], null, 2)}

Provide a concise, highly professional executive HR summary tailored for Indian enterprise management containing:
1. Executive Overview (2-3 sentences on overall workforce attendance health, IST shift adherence, and EPF/ESI compliance health)
2. Key Observations & Regional Trends (Bullet points highlighting geofence compliance across Bengaluru HQ, Mumbai, Gurgaon, and Hyderabad offices, overtime cost impact in INR ₹)
3. Actionable Recommendations for HR & Operations Managers (2-3 practical suggestions, e.g. General Shift vs Night Shift buffer adjustments, WhatsApp attendance alerts tuning, offsite client verification workflows)

Keep formatting clean with Markdown headers and bullet points. Express any monetary estimates in Indian Rupees (₹). Avoid generic fluff.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const reportMarkdown = response.text || 'Unable to generate analysis at this time.';

      return res.json({ report: reportMarkdown });
    } catch (error: any) {
      console.error('Error generating AI report:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate AI report analysis',
      });
    }
  });

  // Vite middleware for dev / express static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
