import { AppConfigOutput } from '../schemas/contracts';
import { runStage1 } from './stage1_intent';
import { runStage2 } from './stage2_design';
import { runStage3 } from './stage3_schema';
import { runStage4 } from './stage4_refine';
import { runStage5 } from './stage5_validate';
import { repairConfig } from '../repair/repair_engine';
 
export interface PipelineExecutionResult {
  success: boolean;
  blueprint?: AppConfigOutput;
  metrics: {
    retriesUsed: number;
    logs: string[];
    simulatedExecutionPassed: boolean;
    validationErrors: string[];
    validationWarnings: string[];
    durationMs: number;
  };
}
 
const MAX_REPAIR_ATTEMPTS = 2;
 
export async function executeCompilerPipeline(
  prompt: string
): Promise<PipelineExecutionResult> {
  const logs: string[] = [];
  const startTime = Date.now();
  let retriesUsed = 0;
 
  const log = (msg: string) => {
    console.log(`[Pipeline] ${msg}`);
    logs.push(msg);
  };
 
  try {
    // ── Stage 1: Intent Extraction ─────────────────────────────────────────
    log('Stage 1 → Extracting intent from prompt...');
    const intent = await runStage1(prompt);
    log(`Stage 1 ✓ — App: "${intent.appName}", Features: ${intent.coreFeatures.join(', ')}`);
    if (intent.ambiguities?.length) {
      log(`Stage 1 ⚠ Ambiguities detected: ${intent.ambiguities.join('; ')}`);
    }
 
    // ── Stage 2: System Design ─────────────────────────────────────────────
    log('Stage 2 → Generating system architecture...');
    const design = await runStage2(intent);
    log(`Stage 2 ✓ — ${design.pages.length} pages, ${design.dbTables.length} tables`);
 
    // ── Stage 3: Schema Generation ─────────────────────────────────────────
    log('Stage 3 → Compiling full application schema...');
    const rawConfig = await runStage3(design);
    log(`Stage 3 ✓ — ${rawConfig.api.endpoints.length} API endpoints, ${rawConfig.database.tables.length} DB tables`);
 
    // ── Stage 4: Refinement ────────────────────────────────────────────────
    log('Stage 4 → Resolving cross-layer inconsistencies...');
    const refinedConfig = await runStage4(rawConfig);
    log('Stage 4 ✓ — Refinement complete');
 
    // ── Stage 5: Validation + Repair Loop ─────────────────────────────────
    log('Stage 5 → Validating schema contract...');
    let currentConfig = refinedConfig;
    let validation = runStage5(currentConfig);
 
    while (!validation.valid && retriesUsed < MAX_REPAIR_ATTEMPTS) {
      retriesUsed++;
      log(`Stage 5 ✗ — ${validation.errors.length} errors found. Attempting repair (attempt ${retriesUsed}/${MAX_REPAIR_ATTEMPTS})...`);
      log(`Errors: ${validation.errors.join(' | ')}`);
      currentConfig = await repairConfig(currentConfig, validation.errors);
      validation = runStage5(currentConfig);
      log(`Stage 5 repair ${retriesUsed} → valid: ${validation.valid}`);
    }
 
    if (validation.warnings.length) {
      log(`Stage 5 ⚠ Warnings: ${validation.warnings.join(' | ')}`);
    }
 
    if (!validation.valid) {
      log(`Stage 5 ✗ — Could not fully repair after ${MAX_REPAIR_ATTEMPTS} attempts. Returning best-effort output.`);
    } else {
      log('Stage 5 ✓ — All validation checks passed');
    }
 
    log(`Pipeline complete in ${Date.now() - startTime}ms`);
 
    return {
      success: true,
      blueprint: currentConfig,
      metrics: {
        retriesUsed,
        logs,
        simulatedExecutionPassed: validation.valid,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        durationMs: Date.now() - startTime,
      },
    };
  } catch (err: any) {
    const errorMessage = err?.message ?? String(err);
    log(`FATAL PIPELINE EXCEPTION: ${errorMessage}`);
    return {
      success: false,
      metrics: {
        retriesUsed,
        logs,
        simulatedExecutionPassed: false,
        validationErrors: [errorMessage],
        validationWarnings: [],
        durationMs: Date.now() - startTime,
      },
    };
  }
}