import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';
import { executeCompilerPipeline } from './pipeline/orchestrator';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🛡️ CRITICAL FIX: Re-add JSON parsing middleware so API requests don't hang
app.use(express.json());

// 📂 PRODUCTION FALLBACK PATH ENGINE: Safely routes straight to frontend files
// When running on Render from backend/dist/index.js, we must look up 3 levels:
app.use(express.static(path.join(__dirname, '../../../frontend'))); 
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use(express.static(path.join(__dirname, '../frontend')));

// 🔌 Catch-all Route: Ensures navigating to root "/" always forces index.html delivery
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../../frontend/index.html'), (err) => {
    if (err) {
      res.sendFile(path.resolve(__dirname, '../../frontend/index.html'));
    }
  });
});

app.post('/api/compile', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt string." });
  try {
    const runResult = await executeCompilerPipeline(openai, prompt);
    return res.json(runResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 System running live at port ${port}`);
});