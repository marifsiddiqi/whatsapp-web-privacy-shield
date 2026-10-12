(() => {
  "use strict";

  const DEFAULTS = {
    enabled: true,
    blurMessages: true,
    blurNames: true,
    blurAvatars: true,
    blurPreviews: true,
    blurMedia: true
  };

  let settings = { ...DEFAULTS };
  let observer = null;
  let scheduled = false;

  const CLASS_MAP = {
    blurMessages: "wps-blur-messages",
    blurNames: "wps-blur-names",
    blurAvatars: "wps-blur-avatars",
    blurPreviews: "wps-blur-previews",
    blurMedia: "wps-blur-media"
  };

  function applyRootState() {
    const root = document.documentElement;
    if (!root) return;

    // Check before toggling to avoid triggering MutationObserver unnecessarily
    const shouldBeEnabled = Boolean(settings.enabled);
    if (root.classList.contains("wps-enabled") !== shouldBeEnabled) {
      root.classList.toggle("wps-enabled", shouldBeEnabled);
    }

    for (const [setting, className] of Object.entries(CLASS_MAP)) {
      const shouldHave = Boolean(settings[setting]);
      if (root.classList.contains(className) !== shouldHave) {
        root.classList.toggle(className, shouldHave);
      }
    }

    if (root.dataset.wpsReady !== "true") {
      root.dataset.wpsReady = "true";
    }
  }

  // Class-based CSS is intentionally used instead of rewriting message content.
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyRootState();
    });
  }

  function startObserver() {
    if (observer || !document.documentElement) return;
    observer = new MutationObserver(() => {
      // Re-apply if WhatsApp Web's SPA or theme changes wipe the root classes.
      // RAF debounce prevents any thrashing.
      scheduleApply();
    });

    // Only observe root documentElement attributes/children, NOT subtree.
    // Near-zero CPU overhead while guaranteeing classes are never lost.
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: false
    });
  }

  // Guard against duplicate listeners if re-injected by background service worker
  if (window.__wps_initialized) {
    chrome.storage.local.get(DEFAULTS, stored => {
      settings = { ...DEFAULTS, ...stored };
      applyRootState();
    });
    return;
  }
  window.__wps_initialized = true;

  chrome.storage.local.get(DEFAULTS, stored => {
    settings = { ...DEFAULTS, ...stored };
    applyRootState();
    startObserver();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    for (const key of Object.keys(DEFAULTS)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? DEFAULTS[key];
    }
    applyRootState();
  });

  chrome.runtime.onMessage.addListener(message => {
    if (message?.type === "PRIVACY_SETTINGS_UPDATED" && message.settings) {
      settings = { ...DEFAULTS, ...message.settings };
      applyRootState();
    }
  });

  // Re-verify when user switches back to this tab
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleApply();
  });
  window.addEventListener("focus", () => {
    scheduleApply();
  });
})();