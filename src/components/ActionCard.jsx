import { Loader2 } from 'lucide-react'

const THEME_STYLES = {
  red: {
    border: 'border-signal-red/60 active:border-signal-red',
    glow: 'shadow-[0_0_0_1px_rgba(229,72,77,0.25)]',
    iconBg: 'bg-signal-redDim text-signal-red',
    tag: 'text-signal-red',
    barIdle: 'bg-signal-redDim',
    barBusy: 'bg-signal-red'
  },
  blue: {
    border: 'border-signal-blue/60 active:border-signal-blue',
    glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.25)]',
    iconBg: 'bg-signal-blueDim text-signal-blue',
    tag: 'text-signal-blue',
    barIdle: 'bg-signal-blueDim',
    barBusy: 'bg-signal-blue'
  },
  green: {
    border: 'border-signal-green/60 active:border-signal-green',
    glow: 'shadow-[0_0_0_1px_rgba(34,197,94,0.25)]',
    iconBg: 'bg-signal-greenDim text-signal-green',
    tag: 'text-signal-green',
    barIdle: 'bg-signal-greenDim',
    barBusy: 'bg-signal-green'
  }
}

const STATUS_COPY = {
  idle: 'READY',
  authenticating: 'VERIFYING ID…',
  running: 'RUNNING…',
  success: 'COMPLETED',
  error: 'FAILED'
}

/**
 * ActionCard — a single, oversized, glove-friendly trigger button.
 * Deliberately tall (min 5.5rem+ per row) with a wide hit target and a
 * visible status rail rather than a subtle spinner, so status reads at a
 * glance from arm's length across a control room.
 */
export default function ActionCard({ icon: Icon, label, description, theme = 'blue', status = 'idle', onTrigger }) {
  const styles = THEME_STYLES[theme] || THEME_STYLES.blue
  const isBusy = status === 'authenticating' || status === 'running'
  const isDisabled = isBusy

  return (
    <button
      type="button"
      onClick={onTrigger}
      disabled={isDisabled}
      aria-busy={isBusy}
      className={`group relative w-full overflow-hidden rounded-2xl border-2 bg-panel-surface text-left shadow-bezel transition-transform duration-100 ${styles.border} ${styles.glow}
        active:scale-[0.98] active:shadow-pressed
        disabled:active:scale-100 disabled:cursor-wait`}
    >
      {/* status rail */}
      <div className={`absolute inset-y-0 left-0 w-2 ${isBusy ? styles.barBusy : styles.barIdle} transition-colors`} />

      <div className="flex min-h-touch items-center gap-5 px-6 py-6 pl-8">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}>
          {isBusy ? (
            <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2.25} />
          ) : (
            <Icon className="h-8 w-8" strokeWidth={2.25} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-semibold leading-tight text-ink-primary">
            {label}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        </div>

        <span
          className={`shrink-0 rounded-md border border-current/30 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider ${styles.tag}`}
        >
          {STATUS_COPY[status] || STATUS_COPY.idle}
        </span>
      </div>
    </button>
  )
}
