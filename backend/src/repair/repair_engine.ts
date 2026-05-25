import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AppConfigSchema, AppConfigOutput } from '../schemas/contracts';

export async function triggerRepairEngine(openai: OpenAI, failedConfig: AppConfigOutput, errors: string[]): Promise<AppConfigOutput> {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an error-repair agent. Correct broken UI/API bindings to align schemas perfectly.' },
      { role: 'user', content: `Config:\n${JSON.stringify(failedConfig)}\n\nFaults:\n${errors.join('\n')}` }
    ],
    response_format: zodResponseFormat(AppConfigSchema, 'fixed_config')
  });
  return completion.choices[0].message.parsed || failedConfig;
}