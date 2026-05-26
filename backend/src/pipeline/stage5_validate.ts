import { AppConfigOutput } from '../schemas/contracts';
 
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
 
/**
 * Pure TypeScript validator — no LLM needed here.
 * Checks structural integrity and cross-layer consistency.
 */
export function runStage5(config: AppConfigOutput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
 
  // ── UI checks ──────────────────────────────────────────────────────────────
  if (!config.ui?.pages?.length) {
    errors.push('ui.pages is empty or missing');
  }
 
  const apiEndpointIds = new Set(config.api?.endpoints?.map((e) => e.id) ?? []);
  const dbTableNames = new Set(config.database?.tables?.map((t) => t.name) ?? []);
  const authRoles = new Set(config.auth?.roles ?? []);
 
  for (const page of config.ui?.pages ?? []) {
    if (!page.route) errors.push(`Page "${page.id}" is missing a route`);
    for (const role of page.accessRoles ?? []) {
      if (!authRoles.has(role)) {
        errors.push(`Page "${page.id}" references unknown role "${role}"`);
      }
    }
    for (const comp of page.components ?? []) {
      if (comp.boundTo && !apiEndpointIds.has(comp.boundTo)) {
        warnings.push(
          `Component "${comp.id}" on page "${page.id}" is bound to unknown endpoint "${comp.boundTo}"`
        );
      }
    }
  }
 
  // ── API checks ─────────────────────────────────────────────────────────────
  if (!config.api?.endpoints?.length) {
    errors.push('api.endpoints is empty or missing');
  }
 
  for (const ep of config.api?.endpoints ?? []) {
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(ep.method)) {
      errors.push(`Endpoint "${ep.id}" has invalid HTTP method "${ep.method}"`);
    }
    for (const role of ep.roles ?? []) {
      if (!authRoles.has(role)) {
        errors.push(`Endpoint "${ep.id}" references unknown role "${role}"`);
      }
    }
  }
 
  // ── DB checks ──────────────────────────────────────────────────────────────
  if (!config.database?.tables?.length) {
    errors.push('database.tables is empty or missing');
  }
 
  for (const table of config.database?.tables ?? []) {
    if (!table.fields?.length) {
      warnings.push(`Table "${table.name}" has no fields defined`);
    }
    for (const rel of table.relations ?? []) {
      if (!dbTableNames.has(rel.targetTable)) {
        errors.push(
          `Table "${table.name}" has relation to unknown table "${rel.targetTable}"`
        );
      }
    }
  }
 
  // ── Auth checks ────────────────────────────────────────────────────────────
  if (!config.auth?.roles?.length) {
    errors.push('auth.roles is empty or missing');
  }
  for (const role of Object.keys(config.auth?.permissions ?? {})) {
    if (!authRoles.has(role)) {
      errors.push(`auth.permissions has entry for unknown role "${role}"`);
    }
  }
 
  // ── Payment checks ─────────────────────────────────────────────────────────
  if (config.payments?.enabled && !config.payments?.provider) {
    warnings.push('payments.enabled is true but no provider is specified');
  }
 
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
 