"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { UniversalLoader } from '@/components/loading'

interface SuperAdminLoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
}

const SuperAdminLoadingContext = createContext<SuperAdminLoadingContextType | undefined>(undefined)

interface SuperAdminLoadingProviderProps {
  children: ReactNode
}

export function SuperAdminLoadingProvider({ children }: SuperAdminLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Determine loading type based on route
  const getLoadingType = (path: string) => {
    if (path.includes('/businesses') || path.includes('/members') || path.includes('/users')) {
      return 'table'
    }
    if (path.includes('/analytics') || path.includes('/reports')) {
      return 'chart'
    }
    if (path.includes('/settings') || path.includes('/roles') || path.includes('/permissions')) {
      return 'form'
    }
    if (path.includes('/packages') || path.includes('/subscriptions')) {
      return 'list'
    }
    if (path === '/super-admin' || path === '/super-admin/') {
      return 'dashboard'
    }
    return 'page'
  }

  const loadingType = getLoadingType(pathname)

  useEffect(() => {
    // Reset loading state when route changes
    setIsLoading(true)
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname])

  const setLoading = (loading: boolean) => setIsLoading(loading)
  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return (
    <SuperAdminLoadingContext.Provider value={{
      isLoading,
      setLoading,
      startLoading,
      stopLoading
    }}>
      <UniversalLoader 
        isLoading={isLoading} 
        type={loadingType}
        message="Loading super admin page..."
      >
        {children}
      </UniversalLoader>
    </SuperAdminLoadingContext.Provider>
  )
}

export function useSuperAdminLoading() {
  const context = useContext(SuperAdminLoadingContext)
  if (context === undefined) {
    throw new Error('useSuperAdminLoading must be used within a SuperAdminLoadingProvider')
  }
  return context
}
