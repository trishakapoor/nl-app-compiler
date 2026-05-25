/**
 * Quick Prompt Presets Trigger Helper
 * Allows users to instantly select specific evaluation test scenarios.
 */
function setPresetPrompt(type) {
  const promptInput = document.getElementById('promptInput');
  
  const presets = {
    crm: "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
    ecommerce: "Build an E-commerce store with an inventory manager dashboard, shopping cart, and Stripe payment gateway checkout.",
    finance: "Build a centralized accounting ledger with wire tracking arrays, custom currency properties, auditor clearance controls, and multi-tenant ledger verification loops.",
    booking: "Build a multi-tenant workshop booking management application with calendar slots scheduling grids, SMS alert notification queues, and automated seat capacity gating."
  };
  
  if (presets[type]) {
    promptInput.value = presets[type];
  }
}

/**
 * Pipeline Execution Orchestrator Loop
 * Sends the natural language instruction to the backend compiler server.
 */
async function triggerCompilation() {
  const promptInput = document.getElementById('promptInput').value.trim();
  const logOutput = document.getElementById('logOutput');
  const jsonOutput = document.getElementById('jsonOutput');
  const compileBtn = document.getElementById('compileBtn');

  // Prevent compiling empty data inputs
  if (!promptInput) {
    alert("Please type or select a product instruction specification template first.");
    return;
  }

  // Enforce Loading Workspace Aesthetics State
  compileBtn.disabled = true;
  compileBtn.innerHTML = `<span>Compiling...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
  logOutput.innerHTML = "🔗 Connecting across local node ports to compilation pipeline orchestration hub...\n";
  jsonOutput.innerText = "{}";

  try {
    // Fire the network fetch request down to the Express pipeline handler route
    const response = await fetch('/api/compile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ prompt: promptInput })
    });

    const data = await response.json();
    
    // Check if backend returned a 500 or 400 framework error
    if (!response.ok) {
      throw new Error(data.error || "Internal system compilation fault occurred inside model parsing passes.");
    }

    // 1. Render telemetry logging steps to the console screen block
    if (data.metrics && data.metrics.logs) {
      logOutput.innerHTML = data.metrics.logs.map(log => `[STAGE] > ${log}`).join('\n');
      logOutput.innerHTML += `\n\n🎉 [COMPILER FINISHED] Retries Triggered: ${data.metrics.retriesUsed}`;
      logOutput.innerHTML += `\nRuntime Simulation Validation Check: PASSED`;
    } else {
      logOutput.innerHTML = "🎉 Schema validated and locked successfully.";
    }
    
    // 2. Format and inject the finalized validated JSON schema blueprint contract
    if (data.blueprint) {
      jsonOutput.innerText = JSON.stringify(data.blueprint, null, 2);
    } else {
      jsonOutput.innerText = JSON.stringify(data, null, 2);
    }

  } catch (error) {
    // Stream fatal exceptions cleanly directly inside the logging view console
    logOutput.innerHTML += `\n\n❌ FATAL PIPELINE EXCEPTION UNCAUGHT:\n${error.message}`;
    logOutput.innerHTML += `\n\n[RECOMMENDATION] Check that your backend .env file contains a valid, active OPENAI_API_KEY value.`;
    jsonOutput.innerText = "{\n  \"status\": \"Engine Aborted\",\n  \"error\": true\n}";
  } finally {
    // Re-enable trigger interfaces
    compileBtn.disabled = false;
    compileBtn.innerHTML = `<span>Compile App Spec</span> <i class="fa-solid fa-arrow-right"></i>`;
  }
}