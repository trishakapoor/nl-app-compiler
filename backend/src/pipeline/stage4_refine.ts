import { callLLM } from './llm_client';
import { AppConfigOutput } from '../schemas/contracts';
 
const SYSTEM = `You are a schema refinement engine.
You will receive an application config that may have cross-layer inconsistencies.
Your job: fix them and return a corrected, complete config.
 
Common issues to check and fix:
- API endpoint paths that reference fields not in any DB table
- UI components bound to API endpoints that don't exist
- Auth roles referenced in permissions that don't exist in the roles array
- Payment plans referenced in UI but not defined in payments.plans
- Missing required fields in any section
 
Return ONLY the corrected raw JSON object — same shape as input, no markdown, no explanation.`;
 
export async function runStage4(config: AppConfigOutput): Promise<AppConfigOutput> {
  const result = await callLLM<AppConfigOutput>(
    SYSTEM,
    `Review and fix this application config for cross-layer consistency:\n\n${JSON.stringify(config, null, 2)}`,
    'Stage4:Refine'
  );
 
  if (!result.ui || !result.api || !result.database || !result.auth) {
    throw new Error('[Stage4] Refinement output is missing required top-level sections');
  }
 
  return result;
}
 