"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { UniversalLoader } from '@/components/loading'

interface AdminLoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
}

const AdminLoadingContext = createContext<AdminLoadingContextType | undefined>(undefined)

interface AdminLoadingProviderProps {
  children: ReactNode
}

export function AdminLoadingProvider({ children }: AdminLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Determine loading type based on route
  const getLoadingType = (path: string) => {
    if (path.includes('/members') || path.includes('/users') || path.includes('/loans') || path.includes('/contributions')) {
      return 'table'
    }
    if (path.includes('/reports') || path.includes('/analytics') || path.includes('/financial')) {
      return 'chart'
    }
    if (path.includes('/settings') || path.includes('/roles') || path.includes('/permissions')) {
      return 'form'
    }
    if (path.includes('/properties') || path.includes('/investment-plans') || path.includes('/documents')) {
      return 'list'
    }
    if (path.includes('/mail-service') || path.includes('/notifications')) {
      return 'page'
    }
    if (path === '/admin' || path === '/admin/') {
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
    <AdminLoadingContext.Provider value={{
      isLoading,
      setLoading,
      startLoading,
      stopLoading
    }}>
      <UniversalLoader 
        isLoading={isLoading} 
        type={loadingType}
        message="Loading admin page..."
      >
        {children}
      </UniversalLoader>
    </AdminLoadingContext.Provider>
  )
}

export function useAdminLoading() {
  const context = useContext(AdminLoadingContext)
  if (context === undefined) {
    throw new Error('useAdminLoading must be used within an AdminLoadingProvider')
  }
  return context
}
