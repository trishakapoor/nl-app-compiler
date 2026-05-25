import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';
import { executeCompilerPipeline } from './pipeline/orchestrator';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

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
  console.log(`🚀 System running live at http://localhost:${port}`);
});