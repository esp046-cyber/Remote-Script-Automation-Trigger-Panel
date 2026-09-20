import { useCallback, useState } from 'react'
import { AlertOctagon, DatabaseZap, Sprout } from 'lucide-react'
import ActionCard from './ActionCard.jsx'
import ConfirmSheet from './ConfirmSheet.jsx'
import { SCRIPT_ACTIONS, triggerScript } from '../services/webhookService.js'
import { authenticateWithBiometrics, isWebAuthnSupported } from '../services/webauthn.js'

const ICONS = {
  RESTART_PI: AlertOctagon,
  SQL_SYNC: DatabaseZap,
  PYTHON_BACKFILL: Sprout
}

const THEMES = {
  RESTART_PI: 'red',
  SQL_SYNC: 'blue',
  PYTHON_BACKFILL: 'green'
}

/**
 * ButtonGrid — the primary screen content. Owns per-action status state
 * and the auth -> confirm -> execute flow:
 *   1. Tap card -> biometric prompt (Face ID)
 *   2. On success -> confirmation sheet (prevents accidental triggers)
 *   3. On confirm -> POST to the action's webhook
 *   4. Toast reports success/failure
 */
export default function ButtonGrid({ pushToast }) {
  const [statuses, setStatuses] = useState({})
  const [pendingConfirm, setPendingConfirm] = useState(null)

  const setStatus = useCallback((id, status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }, [])

  const handleTap = useCallback(
    async (action) => {
      if (!isWebAuthnSupported()) {
        pushToast({
          variant: 'error',
          title: 'Biometric auth unavailable',
          message: 'This browser does not support the Web Authentication API.'
        })
        return
      }

      setStatus(action.id, 'authenticating')
      try {
        await authenticateWithBiometrics()
        setStatus(action.id, 'idle')
        setPendingConfirm(action)
      } catch (err) {
        setStatus(action.id, 'error')
        pushToast({
          variant: 'error',
          title: 'Authentication failed',
          message: err.message || 'Face ID verification was cancelled or failed.'
        })
        window.setTimeout(() => setStatus(action.id, 'idle'), 1500)
      }
    },
    [pushToast, setStatus]
  )

  const handleConfirm = useCallback(async () => {
    const action = pendingConfirm
    setPendingConfirm(null)
    if (!action) return

    setStatus(action.id, 'running')
    try {
      const result = await triggerScript(action.id)
      if (result.ok) {
        setStatus(action.id, 'success')
        pushToast({
          variant: 'success',
          title: `${action.label} — triggered`,
          message: `Webhook responded ${result.status} in ${result.durationMs}ms.`
        })
      } else {
        setStatus(action.id, 'error')
        pushToast({
          variant: 'error',
          title: `${action.label} — failed`,
          message: result.error || `Webhook responded with status ${result.status}.`
        })
      }
    } catch (err) {
      setStatus(action.id, 'error')
      pushToast({
        variant: 'error',
        title: `${action.label} — failed`,
        message: err.message || 'Unexpected error triggering webhook.'
      })
    } finally {
      window.setTimeout(() => setStatus(action.id, 'idle'), 2000)
    }
  }, [pendingConfirm, pushToast, setStatus])

  const handleCancel = useCallback(() => {
    setPendingConfirm(null)
  }, [])

  return (
    <>
      <div className="flex flex-col gap-4 px-5 py-5">
        {Object.values(SCRIPT_ACTIONS).map((action) => (
          <ActionCard
            key={action.id}
            icon={ICONS[action.id]}
            label={action.label}
            description={action.description}
            theme={THEMES[action.id]}
            status={statuses[action.id] || 'idle'}
            onTrigger={() => handleTap(action)}
          />
        ))}
      </div>

      <ConfirmSheet action={pendingConfirm} onConfirm={handleConfirm} onCancel={handleCancel} />
    </>
  )
}
