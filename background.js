(() => {
  "use strict";

  // When extension is installed, updated, or re-enabled:
  // automatically re-inject content script and styles into open WhatsApp Web tabs.
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
      for (const tab of tabs) {
        if (!tab.id) continue;
        try {
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["privacy.css"]
          });
        } catch {
          // CSS injection may fail if tab is not ready
        }
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          });
        } catch {
          // Script injection may fail if tab is not ready
        }
      }
    } catch {
      // Ignore query errors
    }
  });
})();
