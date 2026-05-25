"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerRepairEngine = triggerRepairEngine;
const zod_1 = require("openai/helpers/zod");
const contracts_1 = require("../schemas/contracts");
async function triggerRepairEngine(openai, failedConfig, errors) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are an error-repair agent. Correct broken UI/API bindings to align schemas perfectly.' },
            { role: 'user', content: `Config:\n${JSON.stringify(failedConfig)}\n\nFaults:\n${errors.join('\n')}` }
        ],
        response_format: (0, zod_1.zodResponseFormat)(contracts_1.AppConfigSchema, 'fixed_config')
    });
    return completion.choices[0].message.parsed || failedConfig;
}
