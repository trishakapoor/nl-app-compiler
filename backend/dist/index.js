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
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai"); // Enforce correct class import name
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const orchestrator_1 = require("./pipeline/orchestrator");
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Force validation of the live Render environment Gemini Token
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ CRITICAL ERR: GEMINI_API_KEY is undefined in environment configuration!");
}
// Corrected SDK client initialization instance block
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || "");
app.use(express_1.default.json());
// 📂 PRODUCTION FALLBACK PATH ENGINE
app.use(express_1.default.static(path_1.default.join(__dirname, '../../../frontend')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, '../../../frontend/index.html'), (err) => {
        if (err) {
            res.sendFile(path_1.default.resolve(__dirname, '../../frontend/index.html'));
        }
    });
});
app.post('/api/compile', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Missing prompt string." });
    try {
        // Pass the Google AI instance down to your orchestrator pipeline handler
        const runResult = await (0, orchestrator_1.executeCompilerPipeline)(genAI, prompt);
        return res.json(runResult);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`🚀 System running live with Gemini Engine at port ${port}`);
});
