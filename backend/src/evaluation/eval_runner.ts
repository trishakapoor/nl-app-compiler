import * as dotenv from 'dotenv';
import { EVAL_DATASET } from './test_cases';
import { executeCompilerPipeline } from '../pipeline/orchestrator';
 
dotenv.config();
 
async function runEvaluationSuite() {
  console.log("📈 Running Compiler Benchmarks...");
  for (const test of EVAL_DATASET) {
    console.log(`\n[TEST #${test.id}] Category: ${test.type.toUpperCase()}`);
    const start = Date.now();
    try {
      const result = await executeCompilerPipeline(test.prompt);
      console.log(`Status: ${result.blueprint ? "🎉 PASSED" : "❌ FAILED"}`);
      console.log(`Retries Used: ${result.metrics.retriesUsed}`);
      console.log(`Duration: ${result.metrics.durationMs}ms`);
    } catch (err: any) {
      console.error(`Fault: ${err.message}`);
    }
  }
}
 
if (require.main === module) { runEvaluationSuite(); }
 