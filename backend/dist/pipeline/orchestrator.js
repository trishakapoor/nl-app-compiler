"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCompilerPipeline = executeCompilerPipeline;
const stage1_intent_1 = require("./stage1_intent");
const stage2_design_1 = require("./stage2_design");
const stage3_schema_1 = require("./stage3_schema");
const stage4_refine_1 = require("./stage4_refine");
const stage5_validate_1 = require("./stage5_validate");
const repair_engine_1 = require("../repair/repair_engine");
const simulator_1 = require("../runtime/simulator");
async function executeCompilerPipeline(openai, userPrompt) {
    const logs = [];
    let retriesUsed = 0;
    logs.push("Initializing Intent Compilation Stage 1...");
    const intent = await (0, stage1_intent_1.runStage1)(openai, userPrompt);
    logs.push("Formulating System Domain Configurations Stage 2...");
    const design = await (0, stage2_design_1.runStage2)(openai, intent);
    logs.push("Assembling Distributed Architecture Matrix Schemas Stage 3...");
    let config = await (0, stage3_schema_1.runStage3)(openai, intent, design);
    logs.push("Running Structural Polishing Refinement Pass Stage 4...");
    config = await (0, stage4_refine_1.runStage4)(openai, config);
    logs.push("Running Stage 5: Schema Enforcement Rules Validation...");
    let validation = (0, stage5_validate_1.runStage5Validation)(config);
    while (!validation.isValid && retriesUsed < 3) {
        retriesUsed++;
        logs.push(`Discrepancy detected! Initiating Repair Cycle ${retriesUsed}/3...`);
        logs.push(`Errors: ${JSON.stringify(validation.errors)}`);
        config = await (0, repair_engine_1.triggerRepairEngine)(openai, config, validation.errors);
        validation = (0, stage5_validate_1.runStage5Validation)(config);
    }
    const runtimeCheck = (0, simulator_1.simulateExecution)(config);
    logs.push(`Simulation Layer Verification completed. Status: ${runtimeCheck ? "PASSED" : "FAILED"}`);
    return {
        success: validation.isValid && runtimeCheck,
        blueprint: config,
        metrics: { retriesUsed, logs, simulatedExecutionPassed: runtimeCheck }
    };
}
