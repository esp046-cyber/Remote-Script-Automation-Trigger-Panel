import { ShieldCheck, TriangleAlert } from 'lucide-react'

/**
 * ConfirmSheet — full-width bottom sheet shown after biometric auth
 * succeeds, before the webhook actually fires. A second, deliberate tap
 * protects against accidental triggers from a phone bumping in a pocket
 * or a gloved hand brushing the panel.
 */
export default function ConfirmSheet({ action, onConfirm, onCancel }) {
  if (!action) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl border-t-2 border-panel-borderLit bg-panel-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-bezel">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-panel-border" />

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-signal-amberDim text-signal-amber">
            <TriangleAlert className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-ink-primary">Confirm execution</p>
            <p className="mt-1 text-sm text-ink-muted">
              Identity verified. Tap confirm to run this on the target system now.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-panel-border bg-panel-bg px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-dim">Script</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink-primary">{action.label}</p>
          <p className="mt-1 text-sm text-ink-muted">{action.description}</p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-lg bg-panel-raised px-3 py-2 text-xs text-ink-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-signal-green" strokeWidth={2.25} />
          Face ID verified for this session
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-touch rounded-xl border-2 border-panel-border bg-panel-bg font-display text-base font-semibold uppercase tracking-wide text-ink-muted active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-touch rounded-xl border-2 border-signal-amber bg-signal-amberDim font-display text-base font-semibold uppercase tracking-wide text-signal-amber active:scale-[0.98]"
          >
            Confirm &amp; run
          </button>
        </div>
      </div>
    </div>
  )
}
