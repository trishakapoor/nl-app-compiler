import Groq from 'groq-sdk';

let _client: Groq | null = null;

export function getLLMClient(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[LLM Client] GROQ_API_KEY is missing. ' +
        'Get a free key at console.groq.com → API Keys, then add it to your .env file.'
      );
    }
    _client = new Groq({ apiKey });
  }
  return _client;
}

export async function callLLM<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  label: string = 'LLM'
): Promise<T> {
  const client = getLLMClient();

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
  });

  const raw = response.choices[0]?.message?.content ?? '';
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