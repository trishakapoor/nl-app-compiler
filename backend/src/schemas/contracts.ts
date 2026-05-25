import { z } from 'zod';

export const IntentSchema = z.object({
  rawFeatures: z.array(z.string()).describe("Core components and functional requests"),
  userRoles: z.array(z.string()).describe("User categories or access scopes identified"),
  integrations: z.array(z.string()).describe("External integrations e.g. Stripe, Sendgrid"),
  ambiguities: z.array(z.string()).describe("Unclear parameters requiring compiler assumptions")
});
export type IntentOutput = z.infer<typeof IntentSchema>;

export const EntityPropertySchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'datetime']),
  required: z.boolean()
});

export const ArchitectureEntitySchema = z.object({
  name: z.string(),
  properties: z.array(EntityPropertySchema),
  relationships: z.array(z.string()).describe("Relations e.g., User has many contacts")
});

export const SystemDesignSchema = z.object({
  entities: z.array(ArchitectureEntitySchema),
  accessControlMatrix: z.record(z.string(), z.array(z.string())).describe("Role mapped to allowed operations")
});
export type SystemDesignOutput = z.infer<typeof SystemDesignSchema>;

export const DBSchema = z.object({
  tables: z.record(z.string(), z.record(z.string(), z.string())),
  foreignKeys: z.array(z.string())
});

export const APIEndpointSchema = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  requiredRole: z.string(),
  payloadSchema: z.record(z.string(), z.string()),
  responseSchema: z.record(z.string(), z.string())
});

export const UIComponentSchema = z.object({
  componentId: z.string(),
  type: z.enum(['Form', 'Table', 'DashboardChart', 'Navbar', 'AuthView']),
  bindApiEndpoint: z.string().describe("Must exactly match standard 'METHOD /path' format from API schema"),
  visibleToRoles: z.array(z.string())
});

export const AppConfigSchema = z.object({
  appName: z.string(),
  databaseSchema: DBSchema,
  apiEndpoints: z.array(APIEndpointSchema),
  uiLayout: z.array(UIComponentSchema),
  assumptionsMade: z.array(z.string())
});
export type AppConfigOutput = z.infer<typeof AppConfigSchema>;