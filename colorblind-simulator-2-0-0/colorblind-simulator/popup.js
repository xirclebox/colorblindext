// toggle
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("cb__light-mode");
  themeToggle.textContent =
    themeToggle.textContent === "Dark" ? "Light" : "Dark";
  if (themeToggle.textContent === "Dark") {
    themeToggle.setAttribute("aria-checked", true);
  } else {
    themeToggle.setAttribute("aria-checked", false);
  }
});

// state
let activeColorFilter = "none";
let activeLowVisionFilter = "none";

const resetButton = document.getElementById("resetFilters");

const isDefaultState = () =>
  activeColorFilter === "none" && activeLowVisionFilter === "none";

const updateResetButton = () => {
  resetButton.hidden = isDefaultState();
};

const activeFilters = () => {
  const activeFilterContainer = document.getElementById("active-filters");

  if (activeColorFilter === "none" && activeLowVisionFilter === "none") {
    activeFilterContainer.innerHTML = `<div class="cb__badge">Trichromacy</div>`;
  } else if (activeColorFilter !== "none" && activeLowVisionFilter === "none") {
    activeFilterContainer.innerHTML = `<div class="cb__badge">${activeColorFilter}</div>`;
  } else if (activeColorFilter === "none" && activeLowVisionFilter !== "none") {
    activeFilterContainer.innerHTML = `<ul class="cb__active-filters__list"><li class="cb__badge">Trichromacy</li><li class="cb__badge">${activeLowVisionFilter}</li></ul>`;
  } else {
    activeFilterContainer.innerHTML = `<ul class="cb__active-filters__list"><li class="cb__badge">${activeColorFilter}</li><li class="cb__badge">${activeLowVisionFilter}</li></ul>`;
  }

  updateResetButton();
};

// helpers
function sendMessageToTab(tabId, message, callback) {
  let responded = false;

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      console.log("Message timeout - content script may not be ready");
      if (callback) callback(null);
    }
  }, 1000);

  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (!responded) {
      responded = true;
      clearTimeout(timeout);

      if (chrome.runtime.lastError) {
        console.log("Chrome runtime error:", chrome.runtime.lastError.message);
        if (callback) callback(null);
        return;
      }

      if (callback) callback(response);
    }
  });
}

function dispatchFilters() {
  chrome.storage.local.set({
    colorFilter: activeColorFilter,
    lowVisionFilter: activeLowVisionFilter,
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      sendMessageToTab(tabs[0].id, {
        action: "applyFilters",
        colorFilter: activeColorFilter,
        lowVisionFilter: activeLowVisionFilter,
      });
    }
  });
}

function updateActiveButtons() {
  document.querySelectorAll(".cb__button-option").forEach((btn) => {
    const group = btn.dataset.group;
    const filter = btn.dataset.filter;

    const isActive =
      (group === "color-vision" && filter === activeColorFilter) ||
      (group === "low-vision" && filter === activeLowVisionFilter);

    btn.classList.toggle("active", isActive);
    if (isActive) {
      btn.setAttribute("aria-checked", true);
    } else {
      btn.setAttribute("aria-checked", false);
    }
    activeFilters();
  });
}

// restore saved state
chrome.storage.local.get(["colorFilter", "lowVisionFilter"], (result) => {
  activeColorFilter = result.colorFilter || "none";
  activeLowVisionFilter = result.lowVisionFilter || "none";
  updateActiveButtons();

  // Sync with whatever the tab is actually showing
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      sendMessageToTab(tabs[0].id, { action: "getFilters" }, (response) => {
        if (response) {
          let changed = false;

          if (
            response.colorFilter &&
            response.colorFilter !== activeColorFilter
          ) {
            activeColorFilter = response.colorFilter;
            changed = true;
          }

          if (
            response.lowVisionFilter &&
            response.lowVisionFilter !== activeLowVisionFilter
          ) {
            activeLowVisionFilter = response.lowVisionFilter;
            changed = true;
          }

          if (changed) {
            updateActiveButtons();
            chrome.storage.local.set({
              colorFilter: activeColorFilter,
              lowVisionFilter: activeLowVisionFilter,
            });
          }
        }
      });
    }
  });
});

// reset
resetButton.addEventListener("click", () => {
  activeColorFilter = "none";
  activeLowVisionFilter = "none";
  updateActiveButtons();
  dispatchFilters();
});

document.querySelectorAll(".cb__button-option").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    const group = button.dataset.group;

    if (group === "color-vision") {
      activeColorFilter = activeColorFilter === filter ? "none" : filter;
    } else if (group === "low-vision") {
      activeLowVisionFilter =
        activeLowVisionFilter === filter ? "none" : filter;
    }

    updateActiveButtons();
    dispatchFilters();
  });
});
