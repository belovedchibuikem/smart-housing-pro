"use client"

import { ComponentType, useEffect, useState } from 'react'
import { UniversalLoader } from './universal-loader'

interface WithLoadingOptions {
  type?: 'page' | 'dashboard' | 'table' | 'card' | 'list' | 'chart' | 'form'
  message?: string
  delay?: number
  skeleton?: React.ReactNode
}

export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithLoadingOptions = {}
) {
  return function WithLoadingComponent(props: P & { isLoading?: boolean }) {
    const { isLoading: propLoading, ...restProps } = props
    const [internalLoading, setInternalLoading] = useState(false)
    
    const isLoading = propLoading ?? internalLoading

    // Simulate loading delay if specified
    useEffect(() => {
      if (options.delay && isLoading) {
        const timer = setTimeout(() => {
          setInternalLoading(false)
        }, options.delay)
        return () => clearTimeout(timer)
      }
    }, [isLoading, options.delay])

    return (
      <UniversalLoader
        isLoading={isLoading}
        type={options.type}
        message={options.message}
        skeleton={options.skeleton}
      >
        <WrappedComponent {...(restProps as P)} />
      </UniversalLoader>
    )
  }
}

// Specialized HOCs for different user areas
export function withSuperAdminLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithLoadingOptions, 'type'> = {}
) {
  return withLoading(WrappedComponent, { ...options, type: 'page' })
}

export function withAdminLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithLoadingOptions, 'type'> = {}
) {
  return withLoading(WrappedComponent, { ...options, type: 'page' })
}

export function withMemberLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithLoadingOptions, 'type'> = {}
) {
  return withLoading(WrappedComponent, { ...options, type: 'page' })
}

// Dashboard-specific HOC
export function withDashboardLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithLoadingOptions, 'type'> = {}
) {
  return withLoading(WrappedComponent, { ...options, type: 'dashboard' })
}

// Table-specific HOC
export function withTableLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<WithLoadingOptions, 'type'> = {}
) {
  return withLoading(WrappedComponent, { ...options, type: 'table' })
}
