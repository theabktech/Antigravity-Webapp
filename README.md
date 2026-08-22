# 📱 Antigravity Mobile (AGY Remote PWA)

A mobile-first **Progressive Web App (PWA)** designed to remotely connect to, control, and orchestrate **Google Antigravity** directly from your smartphone with a full native application experience (no browser address bars, fast warm starts, haptics, voice dictation, and standalone window mode).

---

## ✨ Features

- 📲 **Standalone PWA Experience**: Installable on iPhone & Android with custom splash screen, native theme color, safe-area inset handling (Dynamic Island / notch support), and zero browser chrome.
- 📷 **Instant QR Code Camera Pairing**: Scan the pairing QR code from your desktop IDE or terminal to automatically connect over Wi-Fi, LAN, Tailscale, or Cloudflare Tunnel.
- ⚡ **Mobile Action & Approval Center**: 1-tap Approve or Reject pending tool executions (terminal commands, file edits) with haptic feedback and real-time status sync.
- 💬 **Streaming Chat & Autonomous Canvas**:
  - Real-time token streaming with collapsible thought processes.
  - Slash command menu triggers (`/goal`, `/schedule`, `/grill-me`, `/browser`, `/teamwork-preview`, `/learn`).
  - `@` Context attachments (`@workspace`, `@terminal`, `@tasks`, `@rules`).
  - Hands-free **Voice Dictation** via Web Speech API.
  - Markdown, LaTeX formatting, and code blocks with 1-tap copy.
- 💻 **Interactive Remote Shell**: Monospace terminal with mobile touch toolbar (`Ctrl+C`, `Esc`, `Tab`, `↑`, `↓`, `git status`, `Clear`) and live stdout/stderr streams.
- 🤖 **Subagent Mesh & Cron Monitor**: Live dashboard for tracking autonomous background subagents, progress bars, cron schedules, and emergency kill switches.
- 📑 **Artifact & Spec Viewer**: Formatted markdown viewer with multi-file tabs, mermaid diagram rendering, and share sheet integration.
- 🔌 **Desktop Bridge Server**: Lightweight Node.js WebSocket bridge included in `server/bridge.cjs`.

---

## 🚀 Quick Start

### 1. Start the Mobile Web App
```bash
# Install dependencies (if not already done)
npm install

# Start Vite dev server on local network
npm run dev
```
Open the provided Network URL (e.g. `http://192.168.1.x:5173`) on your smartphone browser.

---

## 📲 How to Install as a Native App on Your Phone

### On iOS (iPhone / iPad - Safari)
1. Open the URL in **Safari**.
2. Tap the **Share** button `⎋` (square with upward arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"** `[+]`.
4. Tap **"Add"** in the top-right corner.
5. Antigravity Mobile will now open in fullscreen standalone mode without Safari address bars or navigation.

### On Android (Chrome)
1. Open the URL in **Chrome**.
2. Tap the in-app **"Install"** prompt banner at the bottom (or open the Chrome menu `⋮` and select **"Install app"** / **"Add to Home screen"**).
3. Confirm installation. The app will be added to your app drawer and home screen.

---

## ⚡ Pairing With Your Desktop Antigravity Host

### Method A: Out-of-the-Box Simulator / Demo Mode
The app launches by default with an interactive simulator mode showcasing real-time token streaming, tool approvals, subagents, and shell interactions.

### Method B: Live Desktop Bridge Server
To pair with your live desktop machine:

1. On your PC, start the bridge:
```bash
npm run host:bridge
```
2. The terminal will display your host IP, WebSocket URL (`ws://192.168.1.x:4200`), and security token.
3. On your phone:
   - Tap the **QR Code** icon in the header and scan the terminal QR code, or
   - Tap the Connection pill in the top-left > **Add Custom Host** > Enter your desktop bridge URL and token.

---

## 🛠️ Project Structure

```
d:/Antigravity Webapp/
├── public/
│   ├── manifest.webmanifest   # PWA manifest with standalone display & app shortcuts
│   ├── sw.js                  # Service Worker with offline caching & background sync
│   └── icons/                 # High-res SVG and app icons
├── server/
│   └── bridge.cjs             # Node.js Desktop WebSocket & REST bridge server
├── src/
│   ├── components/
│   │   ├── HeaderBar.tsx      # Status indicator, latency, QR scanner, settings
│   │   ├── Navigation.tsx     # Bottom navigation bar with notification badges
│   │   ├── ChatCanvas.tsx     # Conversation feed, slash commands, voice dictation
│   │   ├── ApprovalCenter.tsx # Mobile Action Center for pending tool decisions
│   │   ├── TerminalConsole.tsx# Mobile terminal with quick-key touch bar
│   │   ├── SubagentMonitor.tsx# Subagent mesh, task progress & cron tracking
│   │   ├── ArtifactViewer.tsx # Markdown specs, benchmarks, diagrams
│   │   ├── ConnectionModal.tsx# Host profiles & pairing manager
│   │   ├── QRScannerModal.tsx # Camera QR code reader & generator
│   │   ├── PWAInstallPrompt.tsx# iOS & Android installation walkthroughs
│   │   └── SettingsDrawer.tsx # Model switch, execution policy & haptics
│   ├── services/
│   │   ├── bridgeClient.ts    # WebSocket & simulation bridge service
│   │   ├── haptics.ts         # Native vibration patterns for mobile
│   │   ├── speech.ts          # Web Speech API voice recognition
│   │   └── mockData.ts        # Seed data for rich offline experience
│   ├── types/
│   │   └── antigravity.ts     # TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🔒 Security & Policies

- **Tool Execution Policies**: Switch between `request-review`, `strict`, `always-proceed`, and `proceed-in-sandbox` directly from the Mobile Settings drawer.
- **Bi-directional Authentication**: Remote connections are secured via bearer tokens and LAN isolation.
