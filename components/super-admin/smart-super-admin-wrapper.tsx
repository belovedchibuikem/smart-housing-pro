"use client"

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { UniversalLoader } from '@/components/loading'

interface SmartSuperAdminWrapperProps {
  children: ReactNode
  delay?: number
  message?: string
}

export function SmartSuperAdminWrapper({ 
  children, 
  delay = 200, 
  message = 'Loading...' 
}: SmartSuperAdminWrapperProps) {
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
    }, delay)

    return () => clearTimeout(timer)
  }, [pathname, delay])

  return (
    <UniversalLoader 
      isLoading={isLoading} 
      type={loadingType}
      message={message}
    >
      {children}
    </UniversalLoader>
  )
}
