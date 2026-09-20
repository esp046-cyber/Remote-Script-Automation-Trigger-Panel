import { Fingerprint, Wifi, WifiOff } from 'lucide-react'

export default function StatusBar({ biometricAvailable, isOnline }) {
  return (
    <header className="sticky top-0 z-30 border-b border-panel-border bg-panel-bg/95 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
            Plant Floor Console
          </p>
          <h1 className="font-display text-2xl font-semibold leading-tight text-ink-primary">
            Script &amp; Automation Trigger
          </h1>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold ${
              isOnline
                ? 'border-signal-green/40 text-signal-green'
                : 'border-signal-red/40 text-signal-red'
            }`}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold ${
              biometricAvailable
                ? 'border-signal-amber/40 text-signal-amber'
                : 'border-panel-border text-ink-dim'
            }`}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            {biometricAvailable ? 'FACE ID READY' : 'NO BIOMETRIC'}
          </span>
        </div>
      </div>
    </header>
  )
}
