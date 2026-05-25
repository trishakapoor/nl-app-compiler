import OpenAI from 'openai';
import { runStage1 } from './stage1_intent';
import { runStage2 } from './stage2_design';
import { runStage3 } from './stage3_schema';
import { runStage4 } from './stage4_refine';
import { runStage5Validation } from './stage5_validate';
import { triggerRepairEngine } from '../repair/repair_engine';
import { simulateExecution } from '../runtime/simulator';
import { AppConfigOutput } from '../schemas/contracts';

export interface PipelineExecutionResult {
  success: boolean;
  blueprint?: AppConfigOutput;
  metrics: { retriesUsed: number; logs: string[]; simulatedExecutionPassed: boolean; };
}

export async function executeCompilerPipeline(openai: OpenAI, userPrompt: string): Promise<PipelineExecutionResult> {
  const logs: string[] = [];
  let retriesUsed = 0;
  
  logs.push("Initializing Intent Compilation Stage 1...");
  const intent = await runStage1(openai, userPrompt);
  
  logs.push("Formulating System Domain Configurations Stage 2...");
  const design = await runStage2(openai, intent);
  
  logs.push("Assembling Distributed Architecture Matrix Schemas Stage 3...");
  let config = await runStage3(openai, intent, design);
  
  logs.push("Running Structural Polishing Refinement Pass Stage 4...");
  config = await runStage4(openai, config);

  logs.push("Running Stage 5: Schema Enforcement Rules Validation...");
  let validation = runStage5Validation(config);
  
  while (!validation.isValid && retriesUsed < 3) {
    retriesUsed++;
    logs.push(`Discrepancy detected! Initiating Repair Cycle ${retriesUsed}/3...`);
    logs.push(`Errors: ${JSON.stringify(validation.errors)}`);
    config = await triggerRepairEngine(openai, config, validation.errors);
    validation = runStage5Validation(config);
  }

  const runtimeCheck = simulateExecution(config);
  logs.push(`Simulation Layer Verification completed. Status: ${runtimeCheck ? "PASSED" : "FAILED"}`);

  return {
    success: validation.isValid && runtimeCheck,
    blueprint: config,
    metrics: { retriesUsed, logs, simulatedExecutionPassed: runtimeCheck }
  };
}