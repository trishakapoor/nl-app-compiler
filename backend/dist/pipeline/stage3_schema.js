"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStage3 = runStage3;
const zod_1 = require("openai/helpers/zod");
const contracts_1 = require("../schemas/contracts");
async function runStage3(openai, intent, design) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Compile database schemas, exact API specs, and matching UI configurations. Ensure complete interface binding alignment.' },
            { role: 'user', content: `Intent: ${JSON.stringify(intent)}\nDesign: ${JSON.stringify(design)}` }
        ],
        response_format: (0, zod_1.zodResponseFormat)(contracts_1.AppConfigSchema, 'app_config')
    });
    if (!completion.choices[0].message.parsed)
        throw new Error("Failed to compile layout blueprint artifacts.");
    return completion.choices[0].message.parsed;
}
