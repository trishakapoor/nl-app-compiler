import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Enforce correct class import name
import * as dotenv from 'dotenv';
import path from 'path';
import { executeCompilerPipeline } from './pipeline/orchestrator';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Force validation of the live Render environment Gemini Token
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ CRITICAL ERR: GEMINI_API_KEY is undefined in environment configuration!");
}

// Corrected SDK client initialization instance block
const genAI = new GoogleGenerativeAI(apiKey || "");

app.use(express.json());

// 📂 PRODUCTION FALLBACK PATH ENGINE
app.use(express.static(path.join(__dirname, '../../../frontend'))); 
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use(express.static(path.join(__dirname, '../frontend')));

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
    // Pass the Google AI instance down to your orchestrator pipeline handler
    const runResult = await executeCompilerPipeline(genAI, prompt);
    return res.json(runResult);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 System running live with Gemini Engine at port ${port}`);
});