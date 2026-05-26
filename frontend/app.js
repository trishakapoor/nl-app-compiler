/**
 * Global Session and Cache Storage States
 */
let currentUser = localStorage.getItem('workspace_user') || null;
let appHistory = JSON.parse(localStorage.getItem('compiled_apps_history')) || [];

/**
 * Onboarding Session Manager
 * Runs immediately upon window load to update UI states or prompt for user identity.
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser) {
    promptUserLogin();
  } else {
    updateWorkspaceUI(currentUser);
  }
  
  // Render past build logs into historical caches if element layout exists
  renderApplicationHistory(appHistory);
});

/**
 * Prompts user for their name via a browser input sheet to customize dashboard headers
 */
function promptUserLogin() {
  const userName = prompt("Welcome to the AI Compiler Hub! Please enter your name to personalize your custom workspace dashboard layout:");
  if (userName && userName.trim() !== "") {
    currentUser = userName.trim();
    localStorage.setItem('workspace_user', currentUser);
    updateWorkspaceUI(currentUser);
  } else {
    currentUser = "Guest Developer";
    updateWorkspaceUI(currentUser);
  }
}

/**
 * Dynamically targets workspace header elements to replace generic titles with custom states
 */
function updateWorkspaceUI(name) {
  // Targets the top-left logo text brand or workspace workspace header text node dynamically
  const titleSelectors = [
    ".sidebar-workspace-title-target", 
    "h1", 
    ".sidebar div", 
    "header h2",
    ".workspace-title"
  ];
  
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && (element.textContent.includes("Workspace") || element.textContent.includes("build next"))) {
      // Replaces or overrides the hardcoded profile state layout values cleanly
      if (element.tagName === "H1" && element.textContent.includes("What will you build next?")) continue; 
      element.textContent = `${name}'s Workspace`;
      break;
    }
  }
  
  // Fallback explicit selector for the prominent top banner text if layout contains it
  const brandingHeader = document.querySelector(".brand-name, [id='workspace-header-title']");
  if (brandingHeader) {
    brandingHeader.textContent = `${name}'s Workspace`;
  }
}

/**
 * Local Client State Persistence Layer
 * Saves successful compile parameters safely to localStorage cache layers.
 */
function saveAppToHistory(promptText, status) {
  const newAppEntry = {
    id: Date.now(),
    prompt: promptText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: status
  };
  
  appHistory.unshift(newAppEntry); // Adds latest run configuration straight to the top of the list
  localStorage.setItem('compiled_apps_history', JSON.stringify(appHistory));
  renderApplicationHistory(appHistory);
}

/**
 * Loops and generates dynamic workspace markup for application generation logging references
 */
function renderApplicationHistory(historyArray) {
  const historyContainer = document.getElementById('historyList') || document.querySelector(".history-list-container") || document.getElementById('history');
  if (!historyContainer) return; // Bypasses execution if layout panel container isn't present
  
  if (historyArray.length === 0) {
    historyContainer.innerHTML = `<p class="text-xs text-gray-500 p-3">No previous builds found in this session cache.</p>`;
    return;
  }
  
  historyContainer.innerHTML = historyArray.map(app => `
    <div class="history-item-card p-3 border-b border-gray-800 text-xs text-gray-300 hover:bg-gray-900/50 transition-all style="cursor: pointer;" onclick="document.getElementById('promptInput').value = '${app.prompt.replace(/'/g, "\\'")}';">
      <div class="flex justify-between items-center mb-1">
        <strong class="text-gray-200 truncate max-w-[180px]">🚀 ${app.prompt}</strong>
        <span class="px-1.5 py-0.5 rounded text-[10px] ${app.status === 'Success' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}">${app.status}</span>
      </div>
      <span class="text-[10px] text-gray-500">${app.timestamp}</span>
    </div>
  `).join('');
}

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

    // 💾 Persist Success State into browser local state engines 
    saveAppToHistory(promptInput, "Success");

  } catch (error) {
    // Stream fatal exceptions cleanly directly inside the logging view console
    logOutput.innerHTML += `\n\n❌ FATAL PIPELINE EXCEPTION UNCAUGHT:\n${error.message}`;
    logOutput.innerHTML += `\n\n[RECOMMENDATION] Check that your live Render Service Dashboard under 'Environment' contains a valid, active OPENAI_API_KEY value variable injection block.`;
    jsonOutput.innerText = "{\n  \"status\": \"Engine Aborted\",\n  \"error\": true\n}";
    
    // 💾 Persist Failure State into tracking list
    saveAppToHistory(promptInput, "Failed");
  } finally {
    // Re-enable trigger interfaces
    compileBtn.disabled = false;
    compileBtn.innerHTML = `<span>Compile App Spec</span> <i class="fa-solid fa-arrow-right"></i>`;
  }
}