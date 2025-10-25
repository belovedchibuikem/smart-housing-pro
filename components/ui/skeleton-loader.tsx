import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

// Base skeleton component with enhanced animations
function SkeletonLoader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-muted/50 via-muted to-muted/50 animate-pulse rounded-md',
        'bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
        className
      )}
      {...props}
    />
  )
}

// Dashboard metrics skeleton
export function DashboardMetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <SkeletonLoader className="h-4 w-24" />
              <SkeletonLoader className="h-8 w-16" />
              <SkeletonLoader className="h-3 w-20" />
            </div>
            <SkeletonLoader className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <SkeletonLoader className="h-6 w-3/4" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-2/3" />
      <div className="flex space-x-2">
        <SkeletonLoader className="h-8 w-20" />
        <SkeletonLoader className="h-8 w-20" />
      </div>
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <SkeletonLoader className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonLoader className="h-4 w-3/4" />
            <SkeletonLoader className="h-3 w-1/2" />
          </div>
          <SkeletonLoader className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <SkeletonLoader className="h-6 w-1/3" />
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonLoader 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 100 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-4">
        <SkeletonLoader className="h-10 w-24" />
        <SkeletonLoader className="h-10 w-24" />
      </div>
    </div>
  )
}

// Page skeleton with header and content
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <SkeletonLoader className="h-8 w-64" />
        <SkeletonLoader className="h-4 w-96" />
      </div>
      
      {/* Content area */}
      <div className="space-y-6">
        <DashboardMetricsSkeleton />
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Universal loading wrapper
interface LoadingWrapperProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
  className?: string
}

export function LoadingWrapper({ 
  isLoading, 
  children, 
  skeleton = <PageSkeleton />,
  className 
}: LoadingWrapperProps) {
  if (isLoading) {
    return <div className={className}>{skeleton}</div>
  }
  
  return <>{children}</>
}

// Spinner component
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Loading state with spinner
export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  className 
}: { 
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 space-y-4', className)}>
      <Spinner size={size} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export { SkeletonLoader }
