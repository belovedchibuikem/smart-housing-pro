"use client"

import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SuperAdminLoader } from '@/components/loading'

interface SuperAdminPageWrapperProps {
  children: ReactNode
  delay?: number
  message?: string
}

export function SuperAdminPageWrapper({ 
  children, 
  delay = 200, 
  message = 'Loading...' 
}: SuperAdminPageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

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
    <SuperAdminLoader isLoading={isLoading} message={message}>
      {children}
    </SuperAdminLoader>
  )
}
