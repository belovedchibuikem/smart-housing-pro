"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from "react"

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface RecaptchaProps {
  onVerify: (token: string) => void
  onError?: () => void
  siteKey?: string
  action?: string
  className?: string
}

export interface RecaptchaRef {
  execute: () => Promise<string>
}

export const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(({
  onVerify,
  onError,
  siteKey,
  action = "submit",
  className = "",
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentSiteKeyRef = useRef<string | null>(null)

  useEffect(() => {
    // Helper function to check if running on localhost (including tenant subdomains)
    const isLocalhostDomain = (hostname: string): boolean => {
      return (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.endsWith('.localhost') || // Handles tenant subdomains like frsc.localhost
        hostname === '[::1]' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') && parseInt(hostname.split('.')[1] || '0') >= 16 && parseInt(hostname.split('.')[1] || '0') <= 31)
      )
    }

    // Check if reCAPTCHA is enabled and fetch site key from API if not provided
    const loadRecaptcha = async () => {
      try {
        let key = siteKey
        let enabled = true
        const hostname = window.location.hostname
        const isLocal = isLocalhostDomain(hostname) || process.env.NODE_ENV === 'development'

        if (!key) {
          try {
            const response = await fetch('/api/auth/recaptcha-site-key')
            if (response.ok) {
              const data = await response.json()
              enabled = data.enabled === true
              key = data.site_key || ''
              
              // If backend says disabled or no key, disable reCAPTCHA
              if (!enabled || !key) {
                enabled = false
              }
            } else {
              // API error - disable reCAPTCHA to prevent blocking users
              console.warn('Failed to fetch reCAPTCHA configuration, disabling reCAPTCHA')
              enabled = false
            }
          } catch (err) {
            console.error('Failed to fetch reCAPTCHA site key:', err)
            // On production, if API fails, disable reCAPTCHA to prevent blocking users
            // On localhost, also disable
            enabled = false
          }
        }

        // Check if running on localhost (development) - including tenant subdomains like *.localhost
        if (isLocal) {
          // Allow disabling via environment variable (default: disabled in localhost)
          const skipInLocal = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED !== 'true'
          if (skipInLocal) {
            enabled = false
          }
        }
        
        // Final check: if no key is available, disable reCAPTCHA
        if (enabled && !key) {
          console.warn('reCAPTCHA enabled but no site key available, disabling')
          enabled = false
        }

        setIsEnabled(enabled)

        // If disabled, mark as loaded and skip script loading
        if (!enabled) {
          setIsLoaded(true)
          return
        }

        if (!key) {
          setError('reCAPTCHA site key not configured')
          return
        }

        currentSiteKeyRef.current = key

        // Load reCAPTCHA v3 script if not already loaded
        if (!window.grecaptcha) {
          const script = document.createElement('script')
          script.src = `https://www.google.com/recaptcha/api.js?render=${key}`
          script.async = true
          script.defer = true
          script.onload = () => {
            window.grecaptcha.ready(() => {
              setIsLoaded(true)
            })
          }
          script.onerror = () => {
            setError('Failed to load reCAPTCHA script')
            onError?.()
          }
          document.head.appendChild(script)
        } else {
          setIsLoaded(true)
          window.grecaptcha.ready(() => {
            setIsLoaded(true)
          })
        }
      } catch (err) {
        setError('Failed to load reCAPTCHA')
        onError?.()
      }
    }

    loadRecaptcha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  const execute = useCallback(async (): Promise<string> => {
    // If reCAPTCHA is disabled (development/localhost), return a dummy token
    if (!isEnabled) {
      const dummyToken = 'dev-token-disabled'
      onVerify(dummyToken)
      return dummyToken
    }

    // If reCAPTCHA should be enabled but isn't ready, check if we're in development
    // In production, we should fail gracefully rather than blocking users
    if (!isLoaded || !window.grecaptcha || !currentSiteKeyRef.current) {
      const hostname = window.location.hostname
      const isLocal = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.endsWith('.localhost') ||
                      process.env.NODE_ENV === 'development'
      
      if (isLocal) {
        // In development, return dummy token if not ready
        const dummyToken = 'dev-token-disabled'
        onVerify(dummyToken)
        return dummyToken
      } else {
        // In production, log error but allow to proceed with empty token
        // Backend will handle validation
        console.error('reCAPTCHA not ready in production')
        setError('reCAPTCHA verification unavailable. Please try again.')
        onError?.()
        throw new Error('reCAPTCHA not ready')
      }
    }

    try {
      const token = await window.grecaptcha.execute(currentSiteKeyRef.current, {
        action: action,
      })
      onVerify(token)
      return token
    } catch (err) {
      const errorMsg = 'Failed to execute reCAPTCHA'
      setError(errorMsg)
      onError?.()
      throw err instanceof Error ? err : new Error(errorMsg)
    }
  }, [isEnabled, isLoaded, action, onVerify, onError])

  // Expose execute method via ref
  useImperativeHandle(ref, () => ({
    execute,
  }), [execute])

  // reCAPTCHA v3 is invisible, so we don't render anything
  // But we can show an error if there's one
  if (error) {
    return (
      <div className={`text-sm text-destructive ${className}`}>
        {error}
      </div>
    )
  }

  return null
})

Recaptcha.displayName = "Recaptcha"

