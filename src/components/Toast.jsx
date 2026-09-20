import { useCallback, useRef, useState } from 'react'

/**
 * useToast — minimal toast queue. Returns { toasts, pushToast } where
 * pushToast({ variant, title, message }) enqueues a toast that
 * auto-dismisses after a few seconds.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const pushToast = useCallback(({ variant = 'info', title, message, duration = 5000 }) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, variant, title, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, pushToast, dismissToast }
}

const VARIANT_STYLES = {
  success: {
    border: 'border-signal-green',
    icon: '✓',
    iconBg: 'bg-signal-green text-panel-bg'
  },
  error: {
    border: 'border-signal-red',
    icon: '!',
    iconBg: 'bg-signal-red text-panel-bg'
  },
  info: {
    border: 'border-signal-amber',
    icon: 'i',
    iconBg: 'bg-signal-amber text-panel-bg'
  }
}

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border-2 ${style.border} bg-panel-raised/95 backdrop-blur px-4 py-3 shadow-bezel animate-[fadeIn_0.2s_ease-out]`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${style.iconBg}`}
              aria-hidden="true"
            >
              {style.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-primary">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-sm text-ink-muted">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-md px-2 py-1 text-ink-dim hover:text-ink-primary"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
