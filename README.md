<div align="center">

# ⚡ Remote Script &amp; Automation Trigger Panel

**Face ID-gated, one-tap maintenance script execution — from your pocket to the plant floor.**

A Progressive Web App that lets an industrial automation engineer fire pre-configured n8n webhooks or cloud functions from an iPhone, without opening a laptop or SSHing into anything mid-shift.

</div>

---

## What this is

A PWA with three oversized, glove-friendly trigger buttons. Each one:

1. Prompts on-device Face ID / Touch ID via the Web Authentication API
2. Shows a confirmation sheet naming exactly what's about to run
3. POSTs to a configured webhook (n8n, Azure Function, or anything else that accepts a POST)
4. Reports success or failure with a toast, including HTTP status and round-trip time

The frontend never runs a script itself — it only ever asks a trusted backend to run one, after a human with a verified fingerprint or face confirms it.

## Included out of the box

| Action | Theme | Purpose |
|---|---|---|
| Restart Frozen PI Interface | 🔴 Red | Restarts the PI Interface service on the historian server |
| Kick-off SQL Data Sync | 🔵 Blue | Runs the scheduled SQL replication job on demand |
| Trigger Python Data Backfill | 🟢 Green | Runs the Python backfill script for missing historian tags |

Add more by editing `src/services/webhookService.js` and `.env`.

## Tech stack

- **React 18** + **Vite** — fast dev loop, small production bundle
- **Tailwind CSS** — industrial dark-mode design system with oversized touch targets
- **vite-plugin-pwa** — offline app shell, installable to the iOS home screen
- **Web Authentication API** (`navigator.credentials.create` / `.get`) — local biometric gating
- **lucide-react** — icon set

## Getting started locally

```bash
npm install
cp .env.example .env      # fill in your real webhook URLs
npm run dev
```

Open the printed local URL. Note: Face ID / platform authenticator prompts require either `localhost` or HTTPS — they will not fire over a plain `http://` LAN IP.

## Configuring your webhooks

Edit `.env` (never commit it — it's gitignored):

```bash
VITE_N8N_WEBHOOK_URL_RESTART_PI=https://your-n8n-instance.example.com/webhook/restart-pi-interface
VITE_N8N_WEBHOOK_URL_SQL_SYNC=https://your-n8n-instance.example.com/webhook/sql-data-sync
VITE_N8N_WEBHOOK_URL_PYTHON_BACKFILL=https://your-n8n-instance.example.com/webhook/python-data-backfill
```

Each webhook receives a JSON POST body:

```json
{
  "action": "RESTART_PI",
  "triggeredAt": "2026-09-20T14:02:11.000Z",
  "source": "remote-script-trigger-panel",
  "operatorNote": null
}
```

Your n8n workflow (or Azure Function) should respond with a 2xx status on success. Anything else, or no response within `VITE_WEBHOOK_TIMEOUT_MS` (default 15s), is surfaced to the operator as a failure toast.

### Securing the webhook endpoint itself

Face ID in this app only proves someone unlocked *this phone* — it doesn't cryptographically authenticate to your n8n instance. Protect the receiving side too:

- Set `VITE_WEBHOOK_SHARED_SECRET` and check the `X-Automation-Token` header in your n8n workflow's first node
- Or put the webhook behind an IP allowlist / VPN
- Or front it with your own auth proxy

## Deploying to GitHub Pages

This repo ships a ready-to-go GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push this repo to GitHub as **`Remote-Script-Trigger-Panel`** (or update `REPO_NAME` in `vite.config.js` to match your actual repo name — this must be exact or asset paths 404)
2. In **Settings → Pages**, set the source to **GitHub Actions**
3. In **Settings → Secrets and variables → Actions**, add:
   - `VITE_N8N_WEBHOOK_URL_RESTART_PI`
   - `VITE_N8N_WEBHOOK_URL_SQL_SYNC`
   - `VITE_N8N_WEBHOOK_URL_PYTHON_BACKFILL`
   - `VITE_WEBHOOK_SHARED_SECRET` (optional)
   - `VITE_WEBHOOK_TIMEOUT_MS` (optional)
4. Push to `main` — the workflow builds, copies `index.html` → `404.html` for client-side routing fallback, and deploys `dist/` to Pages

## Installing on iPhone

1. Open the deployed URL in Safari
2. Tap **Share → Add to Home Screen**
3. Launch from the home screen icon — it opens full-screen, no browser chrome, and works offline for the app shell (webhook triggers still need a live connection)

## Project structure

```
├── .github/workflows/deploy.yml   GitHub Pages CI/CD
├── public/                        Icons + social share image
├── src/
│   ├── components/
│   │   ├── ActionCard.jsx         Oversized trigger button
│   │   ├── ButtonGrid.jsx         Auth → confirm → execute orchestration
│   │   ├── ConfirmSheet.jsx       Post-auth confirmation sheet
│   │   ├── StatusBar.jsx          Connectivity / biometric status header
│   │   └── Toast.jsx              Toast queue + stack
│   ├── services/
│   │   ├── webauthn.js            Face ID / Touch ID wrapper
│   │   └── webhookService.js      Webhook POST layer + action registry
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html                     SEO / OG / Twitter / JSON-LD metadata
├── vite.config.js                 PWA plugin + GitHub Pages base path
├── tailwind.config.js
└── .env.example
```

## Safety notes

- This app is a **trigger**, not a script runner — it has no ability to execute anything beyond firing an HTTP request. All real logic and safety checks belong in your n8n workflow or cloud function.
- The confirmation sheet is a deliberate second tap, separate from the Face ID prompt, so a phone bumping in a pocket can't fire a script on its own.
- Consider adding idempotency / debounce logic in your n8n workflow for actions like service restarts, in case of double-taps or flaky connections causing a retry.

---

<div align="center">

Authorized personnel only · All actions should be logged server-side

</div>
