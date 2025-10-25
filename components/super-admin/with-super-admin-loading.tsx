"use client"

import { ComponentType, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SuperAdminLoader } from '@/components/loading'

interface WithSuperAdminLoadingOptions {
  delay?: number
  message?: string
}

export function withSuperAdminLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithSuperAdminLoadingOptions = {}
) {
  return function WithSuperAdminLoadingComponent(props: P) {
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
      // Reset loading state when route changes
      setIsLoading(true)
      
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, options.delay || 300)

      return () => clearTimeout(timer)
    }, [pathname, options.delay])

    return (
      <SuperAdminLoader 
        isLoading={isLoading}
        message={options.message}
      >
        <WrappedComponent {...props} />
      </SuperAdminLoader>
    )
  }
}

// Specific loaders for different page types
export function withSuperAdminPageLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return withSuperAdminLoading(WrappedComponent, {
    delay: 200,
    message: 'Loading page...'
  })
}

export function withSuperAdminTableLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return withSuperAdminLoading(WrappedComponent, {
    delay: 300,
    message: 'Loading data...'
  })
}

export function withSuperAdminFormLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return withSuperAdminLoading(WrappedComponent, {
    delay: 150,
    message: 'Loading form...'
  })
}
