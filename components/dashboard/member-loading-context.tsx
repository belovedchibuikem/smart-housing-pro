"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { UniversalLoader } from '@/components/loading'

interface MemberLoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
}

const MemberLoadingContext = createContext<MemberLoadingContextType | undefined>(undefined)

interface MemberLoadingProviderProps {
  children: ReactNode
}

export function MemberLoadingProvider({ children }: MemberLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Determine loading type based on route
  const getLoadingType = (path: string) => {
    if (path.includes('/contributions') || path.includes('/loans') || path.includes('/investments') || path.includes('/properties')) {
      return 'table'
    }
    if (path.includes('/reports') || path.includes('/financial-summary')) {
      return 'chart'
    }
    if (path.includes('/profile') || path.includes('/settings')) {
      return 'form'
    }
    if (path.includes('/documents') || path.includes('/notifications')) {
      return 'list'
    }
    if (path.includes('/mail-service') || path.includes('/post-service')) {
      return 'page'
    }
    if (path === '/dashboard' || path === '/dashboard/') {
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
    <MemberLoadingContext.Provider value={{
      isLoading,
      setLoading,
      startLoading,
      stopLoading
    }}>
      <UniversalLoader 
        isLoading={isLoading} 
        type={loadingType}
        message="Loading dashboard..."
      >
        {children}
      </UniversalLoader>
    </MemberLoadingContext.Provider>
  )
}

export function useMemberLoading() {
  const context = useContext(MemberLoadingContext)
  if (context === undefined) {
    throw new Error('useMemberLoading must be used within a MemberLoadingProvider')
  }
  return context
}
