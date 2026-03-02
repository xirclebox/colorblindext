// state
let currentColorFilter = "none";
let currentLowVisionFilter = "none";

// Low vision conditions that use a CSS overlay instead of an SVG filter
const OVERLAY_FILTERS = new Set(["tunnel-vision", "central-vision-loss"]);

//svgs
function createSVGFilters() {
  const existing = document.getElementById("vision-simulator-svg");
  if (existing) existing.remove();

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "vision-simulator-svg";
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";

  svg.innerHTML = `
    <defs>
      <!-- Color vision filters -->
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0.0,   0.0, 0.0
          0.558, 0.442, 0.0,   0.0, 0.0
          0.0,   0.242, 0.758, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="protanomaly">
        <feColorMatrix type="matrix" values="
          0.817, 0.183, 0.0,   0.0, 0.0
          0.333, 0.667, 0.0,   0.0, 0.0
          0.0,   0.125, 0.875, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0.0,   0.0, 0.0
          0.7,   0.3,   0.0,   0.0, 0.0
          0.0,   0.3,   0.7,   0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="deuteranomaly">
        <feColorMatrix type="matrix" values="
          0.8,   0.2,   0.0,   0.0, 0.0
          0.258, 0.742, 0.0,   0.0, 0.0
          0.0,   0.142, 0.858, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="
          0.95,  0.05,  0.0,   0.0, 0.0
          0.0,   0.433, 0.567, 0.0, 0.0
          0.0,   0.475, 0.525, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="tritanomaly">
        <feColorMatrix type="matrix" values="
          0.967, 0.033, 0.0,   0.0, 0.0
          0.0,   0.733, 0.267, 0.0, 0.0
          0.0,   0.183, 0.817, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" values="
          0.299, 0.587, 0.114, 0.0, 0.0
          0.299, 0.587, 0.114, 0.0, 0.0
          0.299, 0.587, 0.114, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>
      <filter id="achromatomaly">
        <feColorMatrix type="matrix" values="
          0.618, 0.320, 0.062, 0.0, 0.0
          0.163, 0.775, 0.062, 0.0, 0.0
          0.163, 0.320, 0.516, 0.0, 0.0
          0.0,   0.0,   0.0,   1.0, 0.0"/>
      </filter>

      <!-- Low vision SVG filters -->
      <filter id="blur-mild">
        <feGaussianBlur stdDeviation="1.5"/>
      </filter>
      <filter id="blur-moderate">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      <filter id="blur-severe">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
      <filter id="low-contrast">
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.5" intercept="0.25"/>
          <feFuncG type="linear" slope="0.5" intercept="0.25"/>
          <feFuncB type="linear" slope="0.5" intercept="0.25"/>
        </feComponentTransfer>
      </filter>
      <filter id="cataracts">
        <feGaussianBlur stdDeviation="2"/>
        <feColorMatrix type="matrix" values="
          1.0, 0.0, 0.0, 0.0, 0.05
          0.0, 1.0, 0.0, 0.0, 0.05
          0.0, 0.0, 0.8, 0.0, 0.0
          0.0, 0.0, 0.0, 1.0, 0.0"/>
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

// combined filter builder
//
// Chains the primitives from two named SVG filters into a single <filter
// id="vs-combined"> so both can be applied with one CSS url() reference.

function buildCombinedSVGFilter(colorId, lvId) {
  const defs = document.querySelector("#vision-simulator-svg defs");

  const old = document.getElementById("vs-combined");
  if (old) old.remove();

  const colorFilter = document.getElementById(colorId);
  const lvFilter = document.getElementById(lvId);

  if (!colorFilter || !lvFilter) return;

  const combined = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "filter",
  );
  combined.id = "vs-combined";

  // Clone primitives from the color filter, chaining each into the next
  let lastResult = "SourceGraphic";
  const colorPrims = colorFilter.querySelectorAll(":scope > *");
  colorPrims.forEach((prim, i) => {
    const clone = prim.cloneNode(true);
    const resultName = `c_${i}`;
    clone.setAttribute("in", lastResult);
    clone.setAttribute("result", resultName);
    lastResult = resultName;
    combined.appendChild(clone);
  });

  // Clone primitives from the lv filter, feeding into the color output
  const lvPrims = lvFilter.querySelectorAll(":scope > *");
  lvPrims.forEach((prim, i) => {
    const clone = prim.cloneNode(true);
    const resultName = `lv_${i}`;
    clone.setAttribute("in", lastResult);
    clone.setAttribute("result", resultName);
    lastResult = resultName;
    combined.appendChild(clone);
  });

  defs.appendChild(combined);
}

// Overlay helpers (tunnel vision / central vision loss)
function removeOverlay() {
  const el = document.getElementById("vs-overlay");
  if (el) el.remove();
}

function createTunnelVisionOverlay() {
  removeOverlay();
  const overlay = document.createElement("div");
  overlay.id = "vs-overlay";
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100vw;height:100vh;
    pointer-events:none;z-index:2147483647;
    background:radial-gradient(
      circle at center,
      transparent 0%,transparent 15%,
      rgba(0,0,0,0.3) 30%,rgba(0,0,0,0.6) 50%,
      rgba(0,0,0,0.85) 70%,rgba(0,0,0,0.95) 100%
    );`;
  document.body.appendChild(overlay);
}

function createCentralVisionLossOverlay() {
  removeOverlay();
  const overlay = document.createElement("div");
  overlay.id = "vs-overlay";
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100vw;height:100vh;
    pointer-events:none;z-index:2147483647;
    background:radial-gradient(
      circle at center,
      rgba(0,0,0,1) 0%,rgba(0,0,0,1) 16%,
      rgba(0,0,0,0.9) 24%,rgba(0,0,0,0.85) 28%,
      transparent 80%,transparent 100%
    );`;
  document.body.appendChild(overlay);
}

// core apply function
function applyFilters(colorFilter, lowVisionFilter) {
  currentColorFilter = colorFilter;
  currentLowVisionFilter = lowVisionFilter;

  const hasColor = colorFilter !== "none";
  const hasLV = lowVisionFilter !== "none";
  const lvIsOverlay = OVERLAY_FILTERS.has(lowVisionFilter);
  const lvIsSVG = hasLV && !lvIsOverlay;

  // Ensure the SVG filter bank is present before referencing filters
  ensureSVGFilters();

  // overlay management
  if (hasLV && lvIsOverlay) {
    if (lowVisionFilter === "tunnel-vision") {
      createTunnelVisionOverlay();
    } else {
      createCentralVisionLossOverlay();
    }
  } else {
    removeOverlay();
  }

  // css filter on <html>
  if (!hasColor && !lvIsSVG) {
    // Nothing active — clear everything
    document.documentElement.style.filter = "";
  } else if (hasColor && !lvIsSVG) {
    // Color only
    document.documentElement.style.filter = `url(#${colorFilter})`;
  } else if (!hasColor && lvIsSVG) {
    // Low vision SVG only
    document.documentElement.style.filter = `url(#${lowVisionFilter})`;
  } else {
    // Both: build a combined filter and apply it
    buildCombinedSVGFilter(colorFilter, lowVisionFilter);
    document.documentElement.style.filter = "url(#vs-combined)";
  }
}

// create SVG filters if they have been removed or never added

function ensureSVGFilters() {
  if (!document.getElementById("vision-simulator-svg")) {
    createSVGFilters();
  }
}

// message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyFilters") {
    applyFilters(
      request.colorFilter || "none",
      request.lowVisionFilter || "none",
    );
    sendResponse({ success: true });
  } else if (request.action === "getFilters") {
    sendResponse({
      colorFilter: currentColorFilter,
      lowVisionFilter: currentLowVisionFilter,
    });
  }
  return true;
});

// Init
function init() {
  createSVGFilters();
  if (currentColorFilter !== "none" || currentLowVisionFilter !== "none") {
    applyFilters(currentColorFilter, currentLowVisionFilter);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
