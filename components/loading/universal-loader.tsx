"use client"

import { ReactNode } from 'react'
import { 
  LoadingWrapper, 
  PageSkeleton, 
  DashboardMetricsSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  ChartSkeleton,
  FormSkeleton,
  LoadingState,
  Spinner
} from '@/components/ui/skeleton-loader'

interface UniversalLoaderProps {
  isLoading: boolean
  children: ReactNode
  type?: 'page' | 'dashboard' | 'table' | 'card' | 'list' | 'chart' | 'form' | 'custom'
  skeleton?: ReactNode
  message?: string
  className?: string
  showSpinner?: boolean
  rows?: number
  columns?: number
  items?: number
  fields?: number
}

export function UniversalLoader({
  isLoading,
  children,
  type = 'page',
  skeleton,
  message,
  className,
  showSpinner = false,
  rows = 5,
  columns = 4,
  items = 5,
  fields = 4
}: UniversalLoaderProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  // Show spinner if requested
  if (showSpinner) {
    return (
      <div className={className}>
        <LoadingState message={message} />
      </div>
    )
  }

  // Custom skeleton provided
  if (skeleton) {
    return (
      <div className={className}>
        {skeleton}
      </div>
    )
  }

  // Default skeletons based on type
  let defaultSkeleton: ReactNode

  switch (type) {
    case 'dashboard':
      defaultSkeleton = <DashboardMetricsSkeleton />
      break
    case 'table':
      defaultSkeleton = <TableSkeleton rows={rows} columns={columns} />
      break
    case 'card':
      defaultSkeleton = <CardSkeleton />
      break
    case 'list':
      defaultSkeleton = <ListSkeleton items={items} />
      break
    case 'chart':
      defaultSkeleton = <ChartSkeleton />
      break
    case 'form':
      defaultSkeleton = <FormSkeleton fields={fields} />
      break
    case 'page':
    default:
      defaultSkeleton = <PageSkeleton />
      break
  }

  return (
    <div className={className}>
      {defaultSkeleton}
    </div>
  )
}

// Specialized loaders for different user areas
export function SuperAdminLoader({ isLoading, children, ...props }: Omit<UniversalLoaderProps, 'type'>) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="page"
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

export function AdminLoader({ isLoading, children, ...props }: Omit<UniversalLoaderProps, 'type'>) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="page"
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

export function MemberLoader({ isLoading, children, ...props }: Omit<UniversalLoaderProps, 'type'>) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="page"
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

// Dashboard-specific loader
export function DashboardLoader({ isLoading, children, ...props }: Omit<UniversalLoaderProps, 'type'>) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="dashboard"
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

// Table-specific loader
export function TableLoader({ 
  isLoading, 
  children, 
  rows = 5, 
  columns = 4,
  ...props 
}: Omit<UniversalLoaderProps, 'type' | 'rows' | 'columns'> & { rows?: number; columns?: number }) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="table"
      rows={rows}
      columns={columns}
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

// Form-specific loader
export function FormLoader({ 
  isLoading, 
  children, 
  fields = 4,
  ...props 
}: Omit<UniversalLoaderProps, 'type' | 'fields'> & { fields?: number }) {
  return (
    <UniversalLoader
      isLoading={isLoading}
      type="form"
      fields={fields}
      {...props}
    >
      {children}
    </UniversalLoader>
  )
}

// Loading overlay for modals/dialogs
export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...',
  className 
}: { 
  isLoading: boolean
  children: ReactNode
  message?: string
  className?: string 
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Button loading state
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  className,
  ...props 
}: { 
  isLoading: boolean
  children: ReactNode
  loadingText?: string
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Spinner size="sm" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
