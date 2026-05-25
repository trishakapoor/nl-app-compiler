import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { SystemDesignSchema, SystemDesignOutput, IntentOutput } from '../schemas/contracts';

export async function runStage2(openai: OpenAI, intent: IntentOutput): Promise<SystemDesignOutput> {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Convert high level structural intent into technical system entities.' },
      { role: 'user', content: JSON.stringify(intent) }
    ],
    response_format: zodResponseFormat(SystemDesignSchema, 'design')
  });
  if (!completion.choices[0].message.parsed) throw new Error("Failed to parse technical architecture specs.");
  return completion.choices[0].message.parsed;
}