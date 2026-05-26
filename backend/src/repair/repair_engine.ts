import { callLLM } from '../pipeline/llm_client';
import { AppConfigOutput } from '../schemas/contracts';

const SYSTEM = `You are a precision schema repair engine.
You will receive an application config JSON and a list of specific validation errors.
Fix ONLY the reported errors. Do not change anything else.
Return ONLY the repaired raw JSON object — no markdown, no explanation.`;

export async function repairConfig(
  config: AppConfigOutput,
  errors: string[]
): Promise<AppConfigOutput> {
  const repaired = await callLLM<AppConfigOutput>(
    SYSTEM,
    `Repair this config to fix these specific errors:

ERRORS TO FIX:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

CONFIG:
${JSON.stringify(config, null, 2)}`,
    'RepairEngine'
  );

  if (!repaired.ui || !repaired.api || !repaired.database || !repaired.auth) {
    console.warn('[RepairEngine] Repaired output lost top-level sections — reverting to original');
    return config;
  }

  return repaired;
}