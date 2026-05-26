import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { EVAL_DATASET } from './test_cases';
import { executeCompilerPipeline } from '../pipeline/orchestrator';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runEvaluationSuite() {
  console.log("📈 Running Compiler Benchmarks...");
  for (const test of EVAL_DATASET) {
    console.log(`\n[TEST #${test.id}] Category: ${test.type.toUpperCase()}`);
    const start = Date.now();
    try {
      const result = await executeCompilerPipeline(openai, test.prompt);
// Replace your old console.log line with this production check:
console.log(`Status: ${result.blueprint ? "🎉 PASSED" : "❌ FAILED"}`);
      console.log(`Retries Used: ${result.metrics.retriesUsed}`);
    } catch (err: any) {
      console.error(`Fault: ${err.message}`);
    }
  }
}
if (require.main === module) { runEvaluationSuite(); }