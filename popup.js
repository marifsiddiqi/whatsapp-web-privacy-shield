const DEFAULTS = {
  enabled: true,
  blurMessages: true,
  blurNames: true,
  blurAvatars: true,
  blurPreviews: true,
  blurMedia: true
};

// ── Translations ──────────────────────────────────────────────────────────────

const I18N = {
  id: {
    privacyMode:    "Privacy Mode",
    checking:       "Memeriksa status…",
    active:         "Perlindungan aktif",
    inactive:       "Perlindungan nonaktif",
    sectionTitle:   "Samarkan elemen",
    blurMessages:   "Isi pesan",
    blurNames:      "Nama kontak dan grup",
    blurAvatars:    "Foto profil dan avatar",
    blurPreviews:   "Preview daftar chat",
    blurMedia:      "Thumbnail media",
    noticeActive:   "Aktif pada tab WhatsApp Web ini. Perubahan diterapkan secara lokal.",
    noticeInactive: "Buka web.whatsapp.com untuk menggunakan extension ini.",
    footer:         "Semua pengaturan disimpan di browser ini."
  },
  en: {
    privacyMode:    "Privacy Mode",
    checking:       "Checking status…",
    active:         "Protection active",
    inactive:       "Protection inactive",
    sectionTitle:   "Blur elements",
    blurMessages:   "Message content",
    blurNames:      "Contact & group names",
    blurAvatars:    "Profile photos & avatars",
    blurPreviews:   "Chat list previews",
    blurMedia:      "Media thumbnails",
    noticeActive:   "Active on this WhatsApp Web tab. Changes applied locally.",
    noticeInactive: "Open web.whatsapp.com to use this extension.",
    footer:         "All settings stored locally in this browser."
  }
};

// ── DOM references ────────────────────────────────────────────────────────────

const ids = Object.keys(DEFAULTS);
const elements = Object.fromEntries(
  ids.map(id => [id, document.getElementById(id)]).filter(([, el]) => el !== null)
);
const statusText  = document.getElementById("statusText");
const pageNotice  = document.getElementById("pageNotice");

let currentLang = "id";

// ── Language ──────────────────────────────────────────────────────────────────

function applyLang(lang) {
  currentLang = lang;
  const t = I18N[lang] ?? I18N.id;

  // Update all static i18n nodes (skip dynamic ones managed by refreshStatus)
  const dynamic = new Set(["checking", "active", "inactive", "noticeActive", "noticeInactive"]);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (!dynamic.has(key) && t[key] !== undefined) el.textContent = t[key];
  });

  // Highlight active lang button
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.documentElement.lang = lang;
}

// ── Tab helpers ───────────────────────────────────────────────────────────────

function isWhatsAppTab(tab) {
  return Boolean(tab?.url && /^https:\/\/web\.whatsapp\.com\//i.test(tab.url));
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

// ── Status display ────────────────────────────────────────────────────────────

async function refreshStatus() {
  const tab = await getActiveTab();
  const onWhatsApp = isWhatsAppTab(tab);
  const t = I18N[currentLang] ?? I18N.id;

  if (pageNotice) {
    pageNotice.textContent = onWhatsApp ? t.noticeActive : t.noticeInactive;
    pageNotice.dataset.i18n = onWhatsApp ? "noticeActive" : "noticeInactive";
  }

  const isEnabled = elements.enabled ? elements.enabled.checked : false;
  if (statusText) {
    statusText.textContent = isEnabled ? t.active : t.inactive;
    statusText.dataset.i18n = isEnabled ? "active" : "inactive";
    statusText.className = "status-badge " + (isEnabled ? "is-on" : "is-off");
  }
}

// ── Settings persistence ──────────────────────────────────────────────────────

async function applySettings() {
  const settings = {};
  for (const id of ids) {
    if (elements[id]) settings[id] = elements[id].checked;
  }
  await chrome.storage.local.set(settings);

  const tab = await getActiveTab();
  if (isWhatsAppTab(tab)) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "PRIVACY_SETTINGS_UPDATED", settings });
    } catch {
      // Content script may not be attached yet; storage change will sync it.
    }
  }
  await refreshStatus();
}

// ── Language toggle ───────────────────────────────────────────────────────────

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    applyLang(lang);
    chrome.storage.local.set({ _lang: lang });
    refreshStatus(); // re-render dynamic strings in new language
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────────

chrome.storage.local.get({ ...DEFAULTS, _lang: "id" }, stored => {
  currentLang = (stored._lang === "en") ? "en" : "id";
  applyLang(currentLang);
  for (const id of ids) {
    if (elements[id]) elements[id].checked = stored[id] ?? DEFAULTS[id];
  }
  refreshStatus();
});

for (const id of ids) {
  if (elements[id]) elements[id].addEventListener("change", applySettings);
}
