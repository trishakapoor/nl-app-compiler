# NL App Compiler

A multi-stage AI pipeline that converts natural language descriptions into validated, executable application specifications — designed like a compiler, not a chatbot.

**Live Demo:** https://nl-appcompiler.onrender.com  
**GitHub:** https://github.com/trishakapoor/nl-app-compiler

---

## What It Does

**Input:**
```
Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.
```

**Output:** Complete validated JSON spec containing:
- UI schema (pages, components, layouts, routes)
- API schema (endpoints, methods, auth, roles)
- Database schema (tables, fields, relations, indexes)
- Auth system (roles, permissions)
- Payment config (plans, provider, pricing)

---

## Pipeline Architecture

```
Natural Language
      │
      ▼
┌─────────────────┐
│ Stage 1: Intent │  Extract features, entities, roles, ambiguities
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ Stage 2: Design  │  Generate pages, API groups, DB tables
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Stage 3: Schema  │  Full UI + API + DB + Auth + Payments config
└────────┬─────────┘
         │
         ▼
┌───────────────────┐
│ Stage 4: Refine   │  Resolve cross-layer inconsistencies
└────────┬──────────┘
         │
         ▼
┌────────────────────────┐
│ Stage 5: Validate      │  Pure TS validator — no LLM
│ + Repair Engine        │  Targeted repair on failure
└────────┬───────────────┘
         │
         ▼
   Validated JSON Spec
```

---

## Key Design Decisions

**Why multi-stage?**  
Each stage has a single responsibility. A failure in schema generation doesn't require re-running intent extraction. Stages are independently debuggable and replaceable — exactly like compiler passes.

**Validation without LLM:**  
Stage 5 is pure TypeScript. It checks cross-layer consistency — are API roles defined in auth? Are UI components bound to real endpoints? Do DB relations point to existing tables? Pure logic, fast and deterministic.

**Surgical repair, not blind retry:**  
On validation failure, only the broken config and the specific error list are sent back to the LLM for targeted repair. Not a full regeneration. Max 2 repair attempts before returning best-effort output.

**Temperature 0.3:**  
Lower temperature means more consistent, structured JSON output across runs with the same input.

**Single LLM client:**  
All 5 stages share one `llm_client.ts`. No provider mismatch, no duplicate configuration, one place to swap models.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+, TypeScript |
| Framework | Express |
| LLM | Groq — Llama 3.3 70B (free tier) |
| Hosting | Render |

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/trishakapoor/nl-app-compiler
cd nl-app-compiler/backend

# Install dependencies
npm install

# Create .env
echo "GROQ_API_KEY=your_key_here" > .env
echo "PORT=3000" >> .env
# Get free key at: console.groq.com → API Keys

# Run locally
npm run dev
# Server starts at http://localhost:3000
```

---

## API Reference

### `POST /compile`
Runs the full 5-stage pipeline on a natural language prompt.

**Request:**
```json
{
  "prompt": "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments."
}
```

**Response:**
```json
{
  "success": true,
  "blueprint": {
    "ui": { "pages": [...], "theme": {...} },
    "api": { "baseUrl": "/api", "endpoints": [...] },
    "database": { "dialect": "postgresql", "tables": [...] },
    "auth": { "strategy": "jwt", "roles": [...], "permissions": {...} },
    "payments": { "enabled": true, "provider": "stripe", "plans": [...] }
  },
  "metrics": {
    "retriesUsed": 0,
    "simulatedExecutionPassed": true,
    "validationErrors": [],
    "validationWarnings": [],
    "durationMs": 12400,
    "logs": [...]
  }
}
```

### `GET /health`
```json
{ "status": "ok", "model": "llama-3.3-70b-versatile" }
```

---

## Project Structure

```
nl-app-compiler/
├── backend/
│   ├── src/
│   │   ├── pipeline/
│   │   │   ├── llm_client.ts       # Shared Groq client, single source of truth
│   │   │   ├── orchestrator.ts     # Pipeline coordinator + retry loop
│   │   │   ├── stage1_intent.ts    # Intent extraction
│   │   │   ├── stage2_design.ts    # System architecture design
│   │   │   ├── stage3_schema.ts    # Full schema generation
│   │   │   ├── stage4_refine.ts    # Cross-layer refinement
│   │   │   └── stage5_validate.ts  # Pure TS validator
│   │   ├── repair/
│   │   │   └── repair_engine.ts    # Targeted repair engine
│   │   ├── schemas/
│   │   │   └── contracts.ts        # TypeScript interfaces for all layers
│   │   ├── evaluation/
│   │   │   ├── eval_runner.ts      # Benchmark runner
│   │   │   └── test_cases.ts       # 20 test cases (10 normal + 10 edge cases)
│   │   ├── runtime/
│   │   │   └── simulator.ts        # Execution simulator
│   │   └── index.ts                # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Free API key from console.groq.com |
| `PORT` | No | Server port (default: 3000) |

---

## Failure Handling

| Scenario | Behavior |
|----------|----------|
| Invalid JSON from LLM | Caught, error thrown with raw output for debugging |
| Missing required fields | Stage-level guards throw descriptive errors |
| Cross-layer inconsistencies | Stage 5 detects, repair engine fixes targeted errors |
| Repair fails twice | Returns best-effort output with validation errors in metrics |
| Vague prompt | Stage 1 documents ambiguities in `assumptions` field |
| Missing API key | Clear error message with setup instructions |
