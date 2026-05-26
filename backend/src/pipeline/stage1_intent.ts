import { callLLM } from './llm_client';
import { IntentOutput } from '../schemas/contracts';
 
const SYSTEM = `You are a technical compiler frontend. 
Parse natural language app descriptions into a structured intent specification.
Return ONLY a raw JSON object — no markdown, no explanation, no code fences.
 
The JSON must have exactly this shape:
{
  "appName": string,
  "appType": string,                        // e.g. "CRM", "E-commerce", "Dashboard"
  "coreFeatures": string[],                 // e.g. ["login", "contacts", "dashboard"]
  "entities": string[],                     // domain objects e.g. ["User", "Contact", "Deal"]
  "roles": string[],                        // e.g. ["admin", "user", "guest"]
  "hasPayments": boolean,
  "hasAnalytics": boolean,
  "authRequired": boolean,
  "ambiguities": string[],                  // anything underspecified — empty array if none
  "assumptions": string[]                   // reasonable defaults you applied
}`;
 
export async function runStage1(prompt: string): Promise<IntentOutput> {
  const result = await callLLM<IntentOutput>(
    SYSTEM,
    `Parse this app description into the intent schema:\n\n${prompt}`,
    'Stage1:Intent'
  );
 
  // Minimal guard — if coreFeatures is missing the whole pipeline will break downstream
  if (!result.coreFeatures || !Array.isArray(result.coreFeatures)) {
    throw new Error('[Stage1] coreFeatures missing or not an array in LLM output');
  }
  if (!result.roles || !Array.isArray(result.roles)) {
    throw new Error('[Stage1] roles missing or not an array in LLM output');
  }
 
  return result;
}