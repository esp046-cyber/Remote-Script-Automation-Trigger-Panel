import { useEffect, useState } from 'react'
import StatusBar from './components/StatusBar.jsx'
import ButtonGrid from './components/ButtonGrid.jsx'
import ToastStack, { useToast } from './components/Toast.jsx'
import { isPlatformAuthenticatorAvailable } from './services/webauthn.js'

export default function App() {
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { toasts, pushToast, dismissToast } = useToast()

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setBiometricAvailable)

    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-panel-bg">
      <StatusBar biometricAvailable={biometricAvailable} isOnline={isOnline} />

      <main className="flex-1 pb-24">
        {!isOnline && (
          <div className="mx-5 mt-4 rounded-lg border border-signal-red/40 bg-signal-redDim/30 px-4 py-2.5 text-sm text-signal-red">
            No connection — script triggers require network access and will fail until you&apos;re back online.
          </div>
        )}
        <ButtonGrid pushToast={pushToast} />
      </main>

      <footer className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-center font-mono text-[11px] text-ink-dim">
        Authorized personnel only · All actions are logged
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
