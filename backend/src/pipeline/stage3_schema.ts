import { callLLM } from './llm_client';
import { DesignOutput, AppConfigOutput } from '../schemas/contracts';
 
const SYSTEM = `You are a schema compiler. 
Given a system design, generate the complete application configuration spec.
Return ONLY a raw JSON object — no markdown, no explanation, no code fences.
 
The JSON must match this shape exactly:
{
  "ui": {
    "pages": [
      {
        "id": string,
        "title": string,
        "route": string,
        "layout": string,
        "accessRoles": string[],
        "components": [
          { "type": string, "id": string, "props": object, "boundTo": string | null }
        ]
      }
    ],
    "theme": { "primaryColor": string, "fontFamily": string }
  },
  "api": {
    "baseUrl": string,
    "endpoints": [
      {
        "id": string,
        "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        "path": string,
        "auth": boolean,
        "roles": string[],
        "requestBody": object | null,
        "responseSchema": object
      }
    ]
  },
  "database": {
    "dialect": string,
    "tables": [
      {
        "name": string,
        "fields": [{ "name": string, "type": string, "required": boolean, "unique": boolean }],
        "indexes": string[],
        "relations": [{ "type": string, "targetTable": string, "foreignKey": string }]
      }
    ]
  },
  "auth": {
    "strategy": string,
    "roles": string[],
    "permissions": { [role: string]: string[] }
  },
  "payments": {
    "enabled": boolean,
    "provider": string | null,
    "plans": [{ "id": string, "name": string, "price": number, "currency": string, "features": string[] }]
  }
}`;
 
export async function runStage3(design: DesignOutput): Promise<AppConfigOutput> {
  const result = await callLLM<AppConfigOutput>(
    SYSTEM,
    `Generate the full application config schema from this design:\n\n${JSON.stringify(design, null, 2)}`,
    'Stage3:Schema'
  );
 
  // Cross-layer consistency checks
  if (!result.ui || !result.api || !result.database || !result.auth) {
    throw new Error('[Stage3] One or more top-level config sections (ui/api/database/auth) missing');
  }
 
  return result;
}
 