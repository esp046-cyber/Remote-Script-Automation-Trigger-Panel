/**
 * webhookService.js
 * ---------------------------------------------------------------------------
 * API service layer responsible for POSTing to backend webhook URLs
 * (n8n, Azure Functions, etc.) that run the actual Python/PowerShell
 * maintenance scripts. The frontend never runs scripts itself — it only
 * ever asks a trusted backend to run one, after biometric gating.
 * ---------------------------------------------------------------------------
 */

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_WEBHOOK_TIMEOUT_MS) || 15000
const SHARED_SECRET = import.meta.env.VITE_WEBHOOK_SHARED_SECRET || ''

/** Registry of triggerable scripts. Add new actions here + a matching env var. */
export const SCRIPT_ACTIONS = {
  RESTART_PI: {
    id: 'RESTART_PI',
    label: 'Restart Frozen PI Interface',
    description: 'Restarts the PI Interface Windows service on the historian server.',
    envVar: 'VITE_N8N_WEBHOOK_URL_RESTART_PI',
    theme: 'red'
  },
  SQL_SYNC: {
    id: 'SQL_SYNC',
    label: 'Kick-off SQL Data Sync',
    description: 'Runs the scheduled SQL replication job on demand.',
    envVar: 'VITE_N8N_WEBHOOK_URL_SQL_SYNC',
    theme: 'blue'
  },
  PYTHON_BACKFILL: {
    id: 'PYTHON_BACKFILL',
    label: 'Trigger Python Data Backfill',
    description: 'Runs the Python backfill script for missing historian tags.',
    envVar: 'VITE_N8N_WEBHOOK_URL_PYTHON_BACKFILL',
    theme: 'green'
  }
}

function resolveWebhookUrl(action) {
  const url = import.meta.env[action.envVar]
  if (!url) {
    throw new Error(
      `No webhook URL configured for "${action.label}". Set ${action.envVar} in your .env file.`
    )
  }
  return url
}

/**
 * Fires a POST request to the webhook backing the given script action.
 * Resolves with a normalized result object; never throws for HTTP-level
 * failures (those are captured in the result), only for setup errors
 * (missing config) or network/timeout failures.
 */
export async function triggerScript(actionId, { operatorNote } = {}) {
  const action = SCRIPT_ACTIONS[actionId]
  if (!action) throw new Error(`Unknown script action: ${actionId}`)

  const url = resolveWebhookUrl(action)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const startedAt = Date.now()

  const headers = { 'Content-Type': 'application/json' }
  if (SHARED_SECRET) headers['X-Automation-Token'] = SHARED_SECRET

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        action: action.id,
        triggeredAt: new Date().toISOString(),
        source: 'remote-script-trigger-panel',
        operatorNote: operatorNote || null
      })
    })

    clearTimeout(timeoutId)
    const durationMs = Date.now() - startedAt

    let payload = null
    try {
      payload = await response.clone().json()
    } catch {
      payload = null
    }

    return {
      ok: response.ok,
      status: response.status,
      durationMs,
      payload,
      action
    }
  } catch (err) {
    clearTimeout(timeoutId)
    const durationMs = Date.now() - startedAt
    const timedOut = err.name === 'AbortError'
    return {
      ok: false,
      status: 0,
      durationMs,
      payload: null,
      action,
      error: timedOut
        ? `Request timed out after ${DEFAULT_TIMEOUT_MS}ms — no response from webhook.`
        : err.message || 'Network error contacting webhook.'
    }
  }
}
