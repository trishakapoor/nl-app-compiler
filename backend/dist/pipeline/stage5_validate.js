"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStage5Validation = runStage5Validation;
function runStage5Validation(config) {
    const errors = [];
    const validEndpoints = new Set(config.apiEndpoints.map(api => `${api.method} ${api.path}`));
    config.uiLayout.forEach(ui => {
        if (ui.bindApiEndpoint !== 'NONE' && !validEndpoints.has(ui.bindApiEndpoint)) {
            errors.push(`UI error: Component '${ui.componentId}' references missing API mapping route [${ui.bindApiEndpoint}]`);
        }
    });
    return { isValid: errors.length === 0, errors };
}
