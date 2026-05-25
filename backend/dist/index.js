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
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const orchestrator_1 = require("./pipeline/orchestrator");
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend')));
app.post('/api/compile', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt)
        return res.status(400).json({ error: "Missing prompt string." });
    try {
        const runResult = await (0, orchestrator_1.executeCompilerPipeline)(openai, prompt);
        return res.json(runResult);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => {
    console.log(`🚀 System running live at http://localhost:${port}`);
});
