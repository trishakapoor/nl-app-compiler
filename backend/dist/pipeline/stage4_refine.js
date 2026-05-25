"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStage4 = runStage4;
const zod_1 = require("openai/helpers/zod");
const contracts_1 = require("../schemas/contracts");
async function runStage4(openai, rawConfig) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Refine the incoming AppConfig configuration. Optimize naming logic consistency.' },
            { role: 'user', content: JSON.stringify(rawConfig) }
        ],
        response_format: (0, zod_1.zodResponseFormat)(contracts_1.AppConfigSchema, 'refined_config')
    });
    return completion.choices[0].message.parsed || rawConfig;
}
