import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { IntentSchema, IntentOutput } from '../schemas/contracts';

export async function runStage1(openai: OpenAI, prompt: string): Promise<IntentOutput> {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a technical compiler frontend. Parse natural language into structured app features.' },
      { role: 'user', content: prompt }
    ],
    response_format: zodResponseFormat(IntentSchema, 'intent')
  });
  if (!completion.choices[0].message.parsed) throw new Error("Failed to parse intent schema.");
  return completion.choices[0].message.parsed;
}