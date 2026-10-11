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
    root.classList.toggle("wps-enabled", Boolean(settings.enabled));
    for (const [setting, className] of Object.entries(CLASS_MAP)) {
      root.classList.toggle(className, Boolean(settings[setting]));
    }
    root.dataset.wpsReady = "true";
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
      // Re-apply root classes once in case WhatsApp's own boot clears them,
      // then disconnect — we don't need to watch every DOM mutation thereafter.
      // Settings changes are handled via chrome.storage.onChanged instead.
      applyRootState();
      observer.disconnect();
      observer = null;
    });
    observer.observe(document.documentElement, { childList: true, subtree: false });
  }

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
})();