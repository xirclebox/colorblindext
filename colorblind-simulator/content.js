// Store current filter state
let currentFilter = "none";

// Load saved filter state from storage
chrome.storage.local.get(["visionFilter"], (result) => {
  if (result.visionFilter) {
    currentFilter = result.visionFilter;
    applyFilter(currentFilter);
  }
});

// Create SVG filter element
function createSVGFilters() {
  // Remove existing filter if present
  const existing = document.getElementById("vision-simulator-svg");
  if (existing) {
    existing.remove();
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "vision-simulator-svg";
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";

  svg.innerHTML = `
    <defs>
      <!-- Protanopia (Red-blind) -->
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0.0,   0.0, 0.0
          0.558, 0.442, 0.0,   0.0, 0.0
          0.0,   0.242, 0.758, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Protanomaly (Red-weak) -->
      <filter id="protanomaly">
        <feColorMatrix type="matrix" values="
          0.817, 0.183, 0.0,   0.0, 0.0
          0.333, 0.667, 0.0,   0.0, 0.0
          0.0,   0.125, 0.875, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Deuteranopia (Green-blind) -->
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0.0,   0.0, 0.0
          0.7,   0.3,   0.0,   0.0, 0.0
          0.0,   0.3,   0.7,   0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Deuteranomaly (Green-weak) -->
      <filter id="deuteranomaly">
        <feColorMatrix type="matrix" values="
          0.8,   0.2,   0.0,   0.0, 0.0
          0.258, 0.742, 0.0,   0.0, 0.0
          0.0,   0.142, 0.858, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Tritanopia (Blue-blind) -->
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="
          0.95,  0.05,  0.0,   0.0, 0.0
          0.0,   0.433, 0.567, 0.0, 0.0
          0.0,   0.475, 0.525, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Tritanomaly (Blue-weak) -->
      <filter id="tritanomaly">
        <feColorMatrix type="matrix" values="
          0.967, 0.033, 0.0,   0.0, 0.0
          0.0,   0.733, 0.267, 0.0, 0.0
          0.0,   0.183, 0.817, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Achromatopsia (Complete color blindness) -->
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" values="
          0.299, 0.587, 0.114, 0.0, 0.0
          0.299, 0.587, 0.114, 0.0, 0.0
          0.299, 0.587, 0.114, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Achromatomaly (Partial color blindness) -->
      <filter id="achromatomaly">
        <feColorMatrix type="matrix" values="
          0.618, 0.320, 0.062, 0.0, 0.0
          0.163, 0.775, 0.062, 0.0, 0.0
          0.163, 0.320, 0.516, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0
        "/>
      </filter>
      
      <!-- Mild Blur -->
      <filter id="blur-mild">
        <feGaussianBlur stdDeviation="1.5"/>
      </filter>
      
      <!-- Moderate Blur -->
      <filter id="blur-moderate">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      
      <!-- Severe Blur -->
      <filter id="blur-severe">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
      
      <!-- Low Contrast -->
      <filter id="low-contrast">
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.5" intercept="0.25"/>
          <feFuncG type="linear" slope="0.5" intercept="0.25"/>
          <feFuncB type="linear" slope="0.5" intercept="0.25"/>
        </feComponentTransfer>
      </filter>
      
      <!-- Cataracts (yellowing + blur) -->
      <filter id="cataracts">
        <feGaussianBlur stdDeviation="2"/>
        <feColorMatrix type="matrix" values="
          1.0, 0.0, 0.0, 0.0, 0.05
          0.0, 1.0, 0.0, 0.0, 0.05
          0.0, 0.0, 0.8, 0.0, 0.0
          0.0, 0.0, 0.0, 1.0, 0.0
        "/>
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.9"/>
          <feFuncG type="linear" slope="0.9"/>
          <feFuncB type="linear" slope="0.7"/>
        </feComponentTransfer>
      </filter>
    </defs>
  `;

  document.body.appendChild(svg);
}

// Apply filter to the page
function applyFilter(filterType) {
  currentFilter = filterType;

  // Save to storage
  chrome.storage.local.set({ visionFilter: filterType });

  if (filterType === "none") {
    document.documentElement.style.filter = "";
    document.body.classList.remove("tunnel-vision", "central-vision-loss");
    // Remove overlay if it exists
    const overlay = document.getElementById("peripheral-vision-overlay");
    if (overlay) overlay.remove();
    return;
  }

  // Remove any CSS-based filters first
  document.body.classList.remove("tunnel-vision", "central-vision-loss");

  // Handle special filters that need CSS overlays
  if (filterType === "tunnel-vision") {
    createTunnelVisionOverlay();
    document.documentElement.style.filter = "";
  } else if (filterType === "central-vision-loss") {
    createCentralVisionLossOverlay();
    document.documentElement.style.filter = "";
  } else {
    // Remove overlay if switching to a different filter
    const overlay = document.getElementById("peripheral-vision-overlay");
    if (overlay) overlay.remove();

    // Ensure SVG filters exist
    createSVGFilters();

    // Apply the SVG filter
    document.documentElement.style.filter = `url(#${filterType})`;
  }
}

// Create overlay for tunnel vision effect
function createTunnelVisionOverlay() {
  // Remove existing overlay
  const existing = document.getElementById("peripheral-vision-overlay");
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "peripheral-vision-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2147483647;
    background: radial-gradient(
      circle at center,
      transparent 0%,
      transparent 15%,
      rgba(0, 0, 0, 0.3) 30%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.85) 70%,
      rgba(0, 0, 0, 0.95) 100%
    );
  `;

  document.body.appendChild(overlay);
}

// Create overlay for central vision loss effect (macular degeneration)
function createCentralVisionLossOverlay() {
  // Remove existing overlay
  const existing = document.getElementById("peripheral-vision-overlay");
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "peripheral-vision-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2147483647;
    background: radial-gradient(
      circle at center,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 16%,
      rgba(0, 0, 0, 0.9) 24%,
      rgba(0, 0, 0, 0.85) 28%,
      transparent 80%,
      transparent 100%
    );
  `;

  document.body.appendChild(overlay);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sendResponse) => {
  if (request.action === "applyFilter") {
    applyFilter(request.filter);
    sendResponse({ success: true });
  } else if (request.action === "getFilter") {
    sendResponse({ filter: currentFilter });
  }
  return true; // Keep message channel open for async response
});

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    createSVGFilters();
    // Reapply filter if it was saved
    if (currentFilter !== "none") {
      applyFilter(currentFilter);
    }
  });
} else {
  createSVGFilters();
  // Reapply filter if it was saved
  if (currentFilter !== "none") {
    applyFilter(currentFilter);
  }
}
