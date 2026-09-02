import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client with standard telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Exam Strategy & Advisory API
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { prompt, examContext, type = 'prep-strategy' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
    }

    let systemInstruction = `You are the elite "2026 Competitive Exam & Recruitment Master Strategist", an expert mentor specialized in Indian government, banking (IBPS/SBI), PSU (CIL/IndianOil/AAI), scientific research (ISRO/BARC), regulatory bodies (SEBI Grade A & YPP), state boards (DSSSB Delhi & RSSB Rajasthan), and central teaching examinations (CTET).
    
Your goal is to provide concise, crystal-clear, high-yield actionable preparation strategies, syllabus breakdowns, study time-blocks, and document verification advice.
Format your responses beautifully with Markdown headings, bullet points, checklists, and high-yield focus areas. Keep advice practical, realistic, and highly motivating.`;

    let userMessage = prompt;

    if (examContext) {
      userMessage = `Exam Context:\n- Name: ${examContext.examName || 'N/A'}\n- Post: ${examContext.postTitle || 'N/A'}\n- Org: ${examContext.organization || 'N/A'}\n- Priority: ${examContext.priority || 'N/A'}\n- Exam Date: ${examContext.examDate || 'TBA'}\n- Key Prep Focus: ${examContext.keyPrep || 'N/A'}\n\nUser Question/Request:\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || 'No response generated.';
    return res.json({ response: outputText });
  } catch (error: any) {
    console.error('Gemini advisor error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate advisory response. Please try again.',
    });
  }
});

// Full-stack Vite development and production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
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
    console.log(`2026 Exam Tracker Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
