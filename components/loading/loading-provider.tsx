"use client"

import { createContext, useContext, ReactNode } from 'react'
import { usePageLoading } from '@/hooks/use-loading'

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const { isLoading, startLoading, stopLoading, withLoading } = usePageLoading()

  return (
    <LoadingContext.Provider value={{
      isLoading,
      startLoading,
      stopLoading,
      withLoading
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider')
  }
  return context
}
