import { AppConfigOutput } from '../schemas/contracts';
 
export function simulateExecution(config: AppConfigOutput): boolean {
  try {
    if (!config.database?.tables || config.database.tables.length === 0) return false;
    if (!config.api?.endpoints || config.api.endpoints.length === 0) return false;
    if (!config.ui?.pages || config.ui.pages.length === 0) return false;
    return true;
  } catch {
    return false;
  }
}
 