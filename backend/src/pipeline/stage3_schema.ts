import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AppConfigSchema, AppConfigOutput, IntentOutput, SystemDesignOutput } from '../schemas/contracts';

export async function runStage3(openai: OpenAI, intent: IntentOutput, design: SystemDesignOutput): Promise<AppConfigOutput> {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Compile database schemas, exact API specs, and matching UI configurations. Ensure complete interface binding alignment.' },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\nDesign: ${JSON.stringify(design)}` }
    ],
    response_format: zodResponseFormat(AppConfigSchema, 'app_config')
  });
  if (!completion.choices[0].message.parsed) throw new Error("Failed to compile layout blueprint artifacts.");
  return completion.choices[0].message.parsed;
}