"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStage1 = runStage1;
const zod_1 = require("openai/helpers/zod");
const contracts_1 = require("../schemas/contracts");
async function runStage1(openai, prompt) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a technical compiler frontend. Parse natural language into structured app features.' },
            { role: 'user', content: prompt }
        ],
        response_format: (0, zod_1.zodResponseFormat)(contracts_1.IntentSchema, 'intent')
    });
    if (!completion.choices[0].message.parsed)
        throw new Error("Failed to parse intent schema.");
    return completion.choices[0].message.parsed;
}
