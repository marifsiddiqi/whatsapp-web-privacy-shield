# WhatsApp Web Privacy Shield

> A lightweight Manifest V3 browser extension that adds a visual privacy layer to WhatsApp Web — blur messages, names, avatars, and more with a single toggle.

![Version](https://img.shields.io/badge/version-1.0.0-25d366?style=flat-square)
![MV3](https://img.shields.io/badge/Manifest-V3-128c7e?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Browser](https://img.shields.io/badge/browser-Chromium-orange?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Privacy Mode toggle** | One-click master switch to enable or disable all blurring |
| 💬 **Message blur** | Blurs the content of all chat messages |
| 👤 **Name blur** | Blurs contact and group names everywhere in the UI |
| 🖼️ **Avatar blur** | Blurs profile photos, default avatars, community icons, and status rings |
| 📋 **Preview blur** | Blurs the message snippets shown in the chat list |
| 🎬 **Media blur** | Blurs image and video thumbnails in the active conversation |
| 🌐 **Bilingual UI** | Popup interface available in **Indonesian (ID)** and **English (EN)** |
| 👁️ **Hover to reveal** | Hover your cursor over any blurred element to quickly peek without disabling the extension |
| 💾 **Local-only** | All settings saved locally — no backend, no analytics, no data collection |

---

## 🚀 Installation

### Brave / Chrome / Edge (any Chromium browser)

1. **Download** this repository  
   - Click **Code → Download ZIP** and extract it, **or**  
   - `git clone https://github.com/marifsiddiqi/whatsapp-web-privacy-shield.git`

2. **Open your browser's extension page**  
   | Browser | URL |
   |---------|-----|
   | Brave   | `brave://extensions` |
   | Chrome  | `chrome://extensions` |
   | Edge    | `edge://extensions` |

3. **Enable Developer Mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Select the **`whatsapp-privacy-shield`** folder — the one that contains `manifest.json`

6. Open or refresh **[https://web.whatsapp.com](https://web.whatsapp.com)**

7. *(Optional)* Pin the extension from your browser's extension menu for quick access

---

## 🖱️ How to Use

1. Click the **Privacy Shield icon** in the toolbar to open the popup
2. Toggle **Privacy Mode** on — a green `PRIVACY MODE ON` badge will appear on WhatsApp Web
3. Use the individual checkboxes to control exactly what gets blurred
4. Switch the popup language between **ID** (Bahasa Indonesia) and **EN** (English) with the toggle in the top-right corner
5. Settings are saved automatically and restored on next launch

---

## 📁 Project Structure

```
whatsapp-privacy-shield/
├── manifest.json   — Extension metadata and permissions (Manifest V3)
├── background.js   — Service worker that auto-injects scripts on install/reload
├── content.js      — Applies/removes blur CSS classes on the page
├── privacy.css     — All CSS blur rules injected into WhatsApp Web
├── popup.html      — Extension popup UI
├── popup.css       — Popup styles (dark theme)
├── popup.js        — Popup logic, settings persistence, and i18n
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## ⚠️ Important Limitations

- **CSS blur is a visual deterrent, not a security measure.** It does not prevent screenshots, screen recording, OS-level monitoring, or browser developer tools.
- **WhatsApp Web may update its DOM** at any time. If selectors in `privacy.css` stop matching, update them and reload the extension.
- **Emoji in contact names** — if WhatsApp renders emoji as inline Unicode text (same node as the name), CSS cannot separate them; the emoji will be blurred together with the name text.
- The extension **never reads, stores, or transmits** any message content.
- The **composer (text input) is intentionally left unblurred** so you can type and send normally.

---

## 🛠️ Development

### Making changes
1. Edit any file
2. Go to your browser's extension page
3. Click the **↺ reload** button on the extension card
4. The background service worker will automatically re-inject scripts into open WhatsApp Web tabs!

### CSS selectors
All blur rules live in [`privacy.css`](privacy.css). Each rule is scoped behind `html.wps-enabled` so they only activate when Privacy Mode is on. If a WhatsApp UI update breaks a selector, inspect the element in DevTools, find the new `data-testid`, and update the relevant rule.

### Adding a new blur category
1. Add the key + default value to `DEFAULTS` in both `content.js` and `popup.js`
2. Add a `CLASS_MAP` entry in `content.js`
3. Add a checkbox in `popup.html` with a matching `id`
4. Add the CSS rule in `privacy.css` using the new class name
5. Add translations for both `id` and `en` in the `I18N` object in `popup.js`

---

## 🔐 Privacy & Permissions

| Permission | Why |
|------------|-----|
| `storage` | Saves your settings locally in the browser |
| `activeTab` | Sends real-time setting updates to the current tab |
| `tabs` | Checks whether the current tab is WhatsApp Web |
| `scripting` | Automatically re-injects content script into open tabs when extension is reloaded/enabled |
| `host_permissions: web.whatsapp.com` | Injects the content script and CSS only on WhatsApp Web |

> No data ever leaves your browser. The extension makes **zero network requests** of its own.

---

## 📋 Quick Test Checklist

- [ ] Toggle Privacy Mode on/off — badge appears/disappears
- [ ] Message text blurs and unblurs correctly
- [ ] Contact names blur in sidebar and header
- [ ] Profile photos blur (including default avatars with no photo)
- [ ] Community icons and status rings blur
- [ ] Chat previews in sidebar blur
- [ ] Archived chats also blur
- [ ] Media thumbnails blur in active conversation
- [ ] Typing and sending messages still works normally
- [ ] Language toggle switches all UI text correctly
- [ ] Settings persist after closing and reopening the popup
- [ ] Browser network tab shows no outbound requests from the extension

---

## 📄 License

MIT © 2024 — Free to use, modify, and distribute.
