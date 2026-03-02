const api = typeof browser !== "undefined" ? browser : chrome;

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

function makeBadge(label) {
  const badge = document.createElement("div");
  badge.className = "cb__badge";
  badge.textContent = label;
  return badge;
}

function makeBadgeList(...labels) {
  const list = document.createElement("ul");
  list.className = "cb__active-filters__list";
  for (const label of labels) {
    const item = document.createElement("li");
    item.className = "cb__badge";
    item.textContent = label;
    list.appendChild(item);
  }
  return list;
}

const activeFilters = () => {
  const activeFilterContainer = document.getElementById("active-filters");

  activeFilterContainer.replaceChildren();

  if (activeColorFilter === "none" && activeLowVisionFilter === "none") {
    activeFilterContainer.appendChild(makeBadge("Trichromacy"));
  } else if (activeColorFilter !== "none" && activeLowVisionFilter === "none") {
    activeFilterContainer.appendChild(makeBadge(activeColorFilter));
  } else if (activeColorFilter === "none" && activeLowVisionFilter !== "none") {
    activeFilterContainer.appendChild(
      makeBadgeList("Trichromacy", activeLowVisionFilter),
    );
  } else {
    activeFilterContainer.appendChild(
      makeBadgeList(activeColorFilter, activeLowVisionFilter),
    );
  }

  updateResetButton();
};

// helpers
function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log("Message timeout - content script may not be ready");
      resolve(null);
    }, 1000);

    api.tabs
      .sendMessage(tabId, message)
      .then((response) => {
        clearTimeout(timeout);
        resolve(response ?? null);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.log("Tab message error:", err?.message ?? err);
        resolve(null);
      });
  });
}

function dispatchFilters() {
  api.storage.local.set({
    colorFilter: activeColorFilter,
    lowVisionFilter: activeLowVisionFilter,
  });

  api.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
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
    btn.setAttribute("aria-checked", isActive ? "true" : "false");
    activeFilters();
  });
}

// restore saved state
api.storage.local
  .get(["colorFilter", "lowVisionFilter"])
  .then((result) => {
    activeColorFilter = result.colorFilter || "none";
    activeLowVisionFilter = result.lowVisionFilter || "none";
    updateActiveButtons();

    // Sync with whatever the tab is actually showing
    return api.tabs.query({ active: true, currentWindow: true });
  })
  .then((tabs) => {
    if (!tabs || !tabs[0]) return;

    return sendMessageToTab(tabs[0].id, { action: "getFilters" }).then(
      (response) => {
        if (!response) return;

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
          api.storage.local.set({
            colorFilter: activeColorFilter,
            lowVisionFilter: activeLowVisionFilter,
          });
        }
      },
    );
  })
  .catch((err) => {
    console.log("Init error:", err?.message ?? err);
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
