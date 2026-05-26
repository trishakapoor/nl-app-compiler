import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executeCompilerPipeline } from './pipeline/orchestrator';
 
dotenv.config();
 
const app = express();
app.use(cors());
app.use(express.json());
 
// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: 'claude-sonnet-4-20250514' });
});
 
// Main compile endpoint
app.post('/compile', async (req, res) => {
  const { prompt } = req.body;
 
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'prompt is required and must be at least 10 characters',
    });
  }
 
  try {
    // NOTE: No AI client is instantiated here anymore.
    // The pipeline creates its own Anthropic client via getLLMClient().
    const result = await executeCompilerPipeline(prompt.trim());
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message ?? 'Unknown server error',
    });
  }
});
 
const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] API key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});
 