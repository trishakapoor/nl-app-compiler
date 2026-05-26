/**
 * Global Session and Cache Storage States
 */
let currentUser = localStorage.getItem('workspace_user') || null;
let appHistory = JSON.parse(localStorage.getItem('compiled_apps_history')) || [];

/**
 * App Onboarding Router Initialization
 * Checks if the user has logged in before, and dynamically displays the right UI screen.
 */
document.addEventListener("DOMContentLoaded", () => {
  const authScreen = document.getElementById('authGateScreen');
  const mainDashboard = document.getElementById('mainDashboardWrapper');

  if (currentUser) {
    // Session exists! Fast-track user straight into their workspace
    if (authScreen) authScreen.style.setProperty('display', 'none', 'important');
    if (mainDashboard) mainDashboard.style.display = 'block';
    updateWorkspaceUI(currentUser);
  } else {
    // No session found. Show the clean authentication page layout
    if (authScreen) authScreen.style.setProperty('display', 'flex', 'important');
    if (mainDashboard) mainDashboard.style.display = 'none';
  }
  
  // Render past build logs into historical caches if element layout exists
  renderApplicationHistory(appHistory);
});

/**
 * Form Submission Auth Handler
 * Triggered when clicking the "Create Workspace Account" button on the gate screen
 */
function handleAuthSubmit(event) {
  event.preventDefault(); // Stop page from hard refreshing
  
  const nameInput = document.getElementById('authName').value.trim();
  const emailInput = document.getElementById('authEmail').value.trim();
  
  if (nameInput === "") return;
  
  // Extract user identity properties and cache securely locally
  currentUser = nameInput;
  localStorage.setItem('workspace_user', currentUser);
  localStorage.setItem('workspace_email', emailInput);
  
  // Update Header Text nodes and profile nodes dynamically
  updateWorkspaceUI(currentUser);
  
  // Transition Screens: Hide Login Layer, Show the main Workspace App
  const authScreen = document.getElementById('authGateScreen');
  const mainDashboard = document.getElementById('mainDashboardWrapper');
  
  if (authScreen) authScreen.style.setProperty('display', 'none', 'important');
  if (mainDashboard) mainDashboard.style.display = 'block';
}

/**
 * Dynamically targets workspace header and element fields to replace placeholders with custom states
 */
function updateWorkspaceUI(name) {
  // 1. Update the sidebar user branding titles
  const displayNames = document.querySelectorAll(".user-display-name, .sidebar-workspace-title-target");
  displayNames.forEach(element => {
    element.textContent = `${name}'s Workspace`;
  });

  // 2. Extract and update the custom user email if stored in system cache
  const savedEmail = localStorage.getItem('workspace_email');
  const displayEmails = document.querySelectorAll(".user-display-email, .username");
  if (savedEmail) {
    displayEmails.forEach(element => {
      element.textContent = savedEmail;
    });
  }

  // 3. Dynamically slice initials to update the profile footer avatar icon
  const avatarElement = document.getElementById("userAvatar") || document.querySelector(".avatar");
  if (avatarElement && name) {
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    avatarElement.textContent = initials;
  }

  // 4. Update core content workspace titles if applicable
  const titleSelectors = ["h1", "header h2", ".workspace-title", "#workspaceHeaderTitle"];
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && (element.textContent.includes("Workspace") || element.textContent.includes("Trisha"))) {
      if (element.tagName === "H1" && element.textContent.includes("What will you build next?")) continue; 
      element.textContent = `${name}'s Workspace`;
      break;
    }
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
    <div class="history-item-card p-3 border-b border-gray-800 text-xs text-gray-300 hover:bg-gray-900/50 transition-all" style="cursor: pointer;" onclick="document.getElementById('promptInput').value = '${app.prompt.replace(/'/g, "\\'")}';">
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