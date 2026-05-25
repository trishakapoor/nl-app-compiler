import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AppConfigSchema, AppConfigOutput } from '../schemas/contracts';

export async function runStage4(openai: OpenAI, rawConfig: AppConfigOutput): Promise<AppConfigOutput> {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Refine the incoming AppConfig configuration. Optimize naming logic consistency.' },
      { role: 'user', content: JSON.stringify(rawConfig) }
    ],
    response_format: zodResponseFormat(AppConfigSchema, 'refined_config')
  });
  return completion.choices[0].message.parsed || rawConfig;
}