"use client"

import { useEffect } from "react"

// Test-environment instrumentation only: no commerce state, network or UI changes.
export default function CommerceGuardReadiness() {
  useEffect(() => {
    document.documentElement.dataset.commerceguardHydrated = "true"
    return () => {
      delete document.documentElement.dataset.commerceguardHydrated
    }
  }, [])
  return null
}
