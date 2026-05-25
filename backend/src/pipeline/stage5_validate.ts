import { AppConfigOutput } from '../schemas/contracts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function runStage5Validation(config: AppConfigOutput): ValidationResult {
  const errors: string[] = [];
  const validEndpoints = new Set(config.apiEndpoints.map(api => `${api.method} ${api.path}`));

  config.uiLayout.forEach(ui => {
    if (ui.bindApiEndpoint !== 'NONE' && !validEndpoints.has(ui.bindApiEndpoint)) {
      errors.push(`UI error: Component '${ui.componentId}' references missing API mapping route [${ui.bindApiEndpoint}]`);
    }
  });
  return { isValid: errors.length === 0, errors };
}