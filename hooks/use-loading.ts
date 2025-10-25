import { useState, useCallback } from 'react'

interface UseLoadingOptions {
  initialLoading?: boolean
  delay?: number
}

interface UseLoadingReturn {
  isLoading: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>
}

export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialLoading = false, delay = 0 } = options
  const [isLoading, setIsLoading] = useState(initialLoading)

  const setLoading = useCallback((loading: boolean) => {
    if (delay > 0 && loading) {
      const timeout = setTimeout(() => setIsLoading(true), delay)
      return () => clearTimeout(timeout)
    } else {
      setIsLoading(loading)
    }
  }, [delay])

  const startLoading = useCallback(() => {
    setLoading(true)
  }, [setLoading])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loading: isLoading, // Alias for convenience
    setLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook for API calls with loading states
export function useApiLoading() {
  const { isLoading, setLoading, withLoading } = useLoading()
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: { 
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
      showError?: boolean
    } = {}
  ): Promise<T | null> => {
    try {
      setError(null)
      const result = await withLoading(apiCall)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      options.onError?.(err as Error)
      
      if (options.showError !== false) {
        console.error('API Error:', errorMessage)
      }
      
      return null
    }
  }, [withLoading, setError])

  return {
    isLoading,
    error,
    setError,
    execute,
    clearError: () => setError(null)
  }
}

// Hook for page-level loading
export function usePageLoading() {
  const { isLoading, setLoading, withLoading } = useLoading({ delay: 200 })
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async <T>(
    loader: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
      resetData?: boolean
    } = {}
  ) => {
    try {
      if (options.resetData) {
        setData(null)
      }
      setError(null)
      
      const result = await withLoading(loader)
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      options.onError?.(err as Error)
      throw err
    }
  }, [withLoading])

  const refresh = useCallback((loader: () => Promise<any>) => {
    return loadData(loader, { resetData: true })
  }, [loadData])

  return {
    isLoading,
    data,
    error,
    setData,
    setError,
    loadData,
    refresh,
    clearError: () => setError(null)
  }
}
