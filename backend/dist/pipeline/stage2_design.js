"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStage2 = runStage2;
const zod_1 = require("openai/helpers/zod");
const contracts_1 = require("../schemas/contracts");
async function runStage2(openai, intent) {
    const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'Convert high level structural intent into technical system entities.' },
            { role: 'user', content: JSON.stringify(intent) }
        ],
        response_format: (0, zod_1.zodResponseFormat)(contracts_1.SystemDesignSchema, 'design')
    });
    if (!completion.choices[0].message.parsed)
        throw new Error("Failed to parse technical architecture specs.");
    return completion.choices[0].message.parsed;
}
