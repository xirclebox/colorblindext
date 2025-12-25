const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("cb__light-mode");

  themeToggle.textContent =
    themeToggle.textContent === "Dark" ? "Light" : "Dark";
});

const filterButtons = document.querySelectorAll(".cb__button-option");

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

chrome.storage.local.get(["currentFilter"], (result) => {
  const savedFilter = result.currentFilter || "none";
  updateActiveButton(savedFilter);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      sendMessageToTab(tabs[0].id, { action: "getFilter" }, (response) => {
        if (response && response.filter) {
          if (response.filter !== savedFilter) {
            updateActiveButton(response.filter);
            chrome.storage.local.set({ currentFilter: response.filter });
          }
        }
      });
    }
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    updateActiveButton(filter);

    chrome.storage.local.set({ currentFilter: filter });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendMessageToTab(tabs[0].id, {
          action: "applyFilter",
          filter: filter,
        });
      }
    });
  });
});

function updateActiveButton(filter) {
  filterButtons.forEach((btn) => btn.classList.remove("active"));

  const activeButton = document.querySelector(`[data-filter="${filter}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
    activeButton.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}
