"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
const test_cases_1 = require("./test_cases");
const orchestrator_1 = require("../pipeline/orchestrator");
dotenv.config();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
async function runEvaluationSuite() {
    console.log("📈 Running Compiler Benchmarks...");
    for (const test of test_cases_1.EVAL_DATASET) {
        console.log(`\n[TEST #${test.id}] Category: ${test.type.toUpperCase()}`);
        const start = Date.now();
        try {
            const result = await (0, orchestrator_1.executeCompilerPipeline)(openai, test.prompt);
            // Replace your old console.log line with this production check:
            console.log(`Status: ${result.blueprint ? "🎉 PASSED" : "❌ FAILED"}`);
            console.log(`Retries Used: ${result.metrics.retriesUsed}`);
        }
        catch (err) {
            console.error(`Fault: ${err.message}`);
        }
    }
}
if (require.main === module) {
    runEvaluationSuite();
}
