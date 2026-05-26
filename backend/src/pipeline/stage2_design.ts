import { callLLM } from './llm_client';
import { IntentOutput, DesignOutput } from '../schemas/contracts';
 
const SYSTEM = `You are a software architect. 
Given a structured app intent, produce a high-level system design.
Return ONLY a raw JSON object — no markdown, no explanation, no code fences.
 
The JSON must have exactly this shape:
{
  "pages": [
    { "name": string, "route": string, "accessRoles": string[], "components": string[] }
  ],
  "apiGroups": [
    { "resource": string, "endpoints": [{ "method": string, "path": string, "auth": boolean }] }
  ],
  "dbTables": [
    { "name": string, "fields": [{ "name": string, "type": string, "required": boolean }], "relations": string[] }
  ],
  "authStrategy": string,
  "paymentProvider": string | null
}`;
 
export async function runStage2(intent: IntentOutput): Promise<DesignOutput> {
  const result = await callLLM<DesignOutput>(
    SYSTEM,
    `Design the system architecture for this app intent:\n\n${JSON.stringify(intent, null, 2)}`,
    'Stage2:Design'
  );
 
  if (!result.pages || !Array.isArray(result.pages)) {
    throw new Error('[Stage2] pages array missing from design output');
  }
  if (!result.dbTables || !Array.isArray(result.dbTables)) {
    throw new Error('[Stage2] dbTables array missing from design output');
  }
 
  return result;
}
 