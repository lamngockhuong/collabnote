'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.isSecureContext
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error)
        })
    } else if (typeof window !== 'undefined' && !window.isSecureContext) {
      console.warn('[Service Worker] Skipped registration: App is not running in a secure context (HTTPS or localhost)')
    }
  }, [])

  return null
}
