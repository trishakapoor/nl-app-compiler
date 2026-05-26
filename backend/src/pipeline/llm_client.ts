import Anthropic from '@anthropic-ai/sdk';
 
// Single shared client — instantiated once, reused across all pipeline stages
let _client: Anthropic | null = null;
 
export function getLLMClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[LLM Client] ANTHROPIC_API_KEY is missing. ' +
        'Set it in your .env file locally, or in Render → Environment → Add Env Var.'
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
 
/**
 * Core call wrapper used by every pipeline stage.
 * Always requests raw JSON — no markdown, no preamble.
 * Returns the parsed object so stages never have to JSON.parse themselves.
 */
export async function callLLM<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  label: string = 'LLM'
): Promise<T> {
  const client = getLLMClient();
 
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',  // Sonnet 4 — best balance of speed + quality
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
 
  const raw = (response.content[0] as Anthropic.TextBlock).text;
 
  // Strip markdown fences the model might accidentally emit
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
 
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `[${label}] Model returned non-JSON output.\n` +
      `Raw response (first 300 chars): ${cleaned.slice(0, 300)}`
    );
  }
}
 