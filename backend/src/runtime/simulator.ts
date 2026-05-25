import { AppConfigOutput } from '../schemas/contracts';

export function simulateExecution(config: AppConfigOutput): boolean {
  try {
    if (!config.appName || Object.keys(config.databaseSchema.tables).length === 0) return false;
    if (config.apiEndpoints.length === 0 || config.uiLayout.length === 0) return false;
    return true;
  } catch {
    return false;
  }
}