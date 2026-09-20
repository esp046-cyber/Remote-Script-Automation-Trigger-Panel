/**
 * webauthn.js
 * ---------------------------------------------------------------------------
 * Thin wrapper around the Web Authentication API used to gate script
 * execution behind on-device biometrics (Face ID / Touch ID / Android
 * biometric prompt).
 *
 * IMPORTANT — scope of this implementation:
 * This performs *device-local* attestation only: it proves that whoever is
 * holding this phone can satisfy its platform authenticator (Face ID). It
 * does NOT perform server-side signature verification, because this app has
 * no backend of its own — the credential is registered and checked entirely
 * in the browser using the Credential Management API's local storage.
 *
 * For a deployment where the webhook target itself needs cryptographic proof
 * of identity (not just "a biometric prompt appeared"), pair this with a
 * real relying-party server that issues challenges and verifies the
 * signed assertion server-side. This client-only flow is intended as a
 * strong "are you actually the engineer holding this device" speed bump
 * before firing a webhook, not as a substitute for backend auth on the
 * n8n/cloud function side (those endpoints should still be protected,
 * e.g. with the shared-secret header or IP allowlisting).
 * ---------------------------------------------------------------------------
 */

const RP_NAME = 'Remote Script & Automation Trigger Panel'
const STORAGE_KEY = 'rsatp_webauthn_credential_id'
const USER_HANDLE_KEY = 'rsatp_webauthn_user_handle'

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBuffer(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const raw = atob(padded)
  const buffer = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) buffer[i] = raw.charCodeAt(i)
  return buffer.buffer
}

function randomChallenge() {
  return crypto.getRandomValues(new Uint8Array(32))
}

/** Whether this browser exposes the WebAuthn APIs at all. */
export function isWebAuthnSupported() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials
}

/** Whether a platform authenticator (Face ID / Touch ID / Windows Hello) is available. */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/** Whether this device already has a registered credential for this app. */
export function hasRegisteredCredential() {
  return !!localStorage.getItem(STORAGE_KEY)
}

/**
 * One-time enrollment: creates a platform-bound passkey and stores its
 * credential ID locally. Triggers the Face ID / Touch ID enrollment prompt.
 */
export async function registerBiometricCredential(displayName = 'Automation Engineer') {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device/browser.')
  }

  let userHandle = localStorage.getItem(USER_HANDLE_KEY)
  if (!userHandle) {
    userHandle = bufferToBase64Url(randomChallenge())
    localStorage.setItem(USER_HANDLE_KEY, userHandle)
  }

  const publicKey = {
    challenge: randomChallenge(),
    rp: {
      name: RP_NAME
    },
    user: {
      id: base64UrlToBuffer(userHandle),
      name: displayName,
      displayName
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred'
    },
    timeout: 60000,
    attestation: 'none'
  }

  const credential = await navigator.credentials.create({ publicKey })
  if (!credential) throw new Error('Credential creation was cancelled.')

  const credentialId = bufferToBase64Url(credential.rawId)
  localStorage.setItem(STORAGE_KEY, credentialId)
  return credentialId
}

/**
 * Prompts Face ID / Touch ID and resolves true only if the on-device
 * biometric challenge succeeds. Registers a credential automatically on
 * first run if none exists yet.
 */
export async function authenticateWithBiometrics() {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device/browser.')
  }

  if (!hasRegisteredCredential()) {
    await registerBiometricCredential()
  }

  const credentialId = localStorage.getItem(STORAGE_KEY)

  const publicKey = {
    challenge: randomChallenge(),
    allowCredentials: [
      {
        id: base64UrlToBuffer(credentialId),
        type: 'public-key',
        transports: ['internal']
      }
    ],
    userVerification: 'required',
    timeout: 60000
  }

  const assertion = await navigator.credentials.get({ publicKey })
  if (!assertion) throw new Error('Biometric authentication was cancelled.')

  return true
}

/** Clears the locally stored credential, forcing re-enrollment next time. */
export function resetBiometricEnrollment() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(USER_HANDLE_KEY)
}
