# Universal Loading System

A comprehensive loading system for the smart housing platform that provides skeleton loaders, spinners, and loading states across all user areas (super-admin, admin, and member).

## Features

- 🎨 **Beautiful skeleton loaders** with shimmer animations
- 🔄 **Multiple loading types** (page, dashboard, table, card, list, chart, form)
- 🎯 **User-specific loaders** (SuperAdmin, Admin, Member)
- ⚡ **Easy to use hooks** for loading state management
- 🧩 **HOCs for automatic loading** states
- 📱 **Responsive design** following UI/UX best practices
- 🎛️ **Customizable** with props and options

## Quick Start

### 1. Basic Usage

```tsx
import { SuperAdminLoader, usePageLoading } from '@/components/loading'

function MyPage() {
  const { isLoading, loadData } = usePageLoading()
  
  useEffect(() => {
    loadData(async () => {
      const response = await fetch('/api/data')
      return response.json()
    })
  }, [loadData])

  return (
    <SuperAdminLoader isLoading={isLoading}>
      <div>Your content here</div>
    </SuperAdminLoader>
  )
}
```

### 2. Different Loading Types

```tsx
import { 
  DashboardLoader, 
  TableLoader, 
  FormLoader,
  CardSkeleton 
} from '@/components/loading'

// Dashboard loading
<DashboardLoader isLoading={isLoading}>
  <DashboardContent />
</DashboardLoader>

// Table loading
<TableLoader isLoading={isLoading} rows={10} columns={5}>
  <TableContent />
</TableLoader>

// Form loading
<FormLoader isLoading={isLoading} fields={6}>
  <FormContent />
</FormLoader>

// Custom skeleton
<UniversalLoader 
  isLoading={isLoading}
  skeleton={<CardSkeleton />}
>
  <Content />
</UniversalLoader>
```

### 3. Using Hooks

```tsx
import { usePageLoading, useApiLoading } from '@/hooks/use-loading'

function MyComponent() {
  // Page-level loading
  const { isLoading, data, error, loadData } = usePageLoading()
  
  // API loading with error handling
  const { isLoading: apiLoading, error: apiError, execute } = useApiLoading()
  
  const handleSubmit = async () => {
    await execute(
      () => api.post('/endpoint', data),
      {
        onSuccess: (result) => console.log('Success!', result),
        onError: (error) => console.error('Error:', error)
      }
    )
  }
}
```

### 4. Higher-Order Components (HOCs)

```tsx
import { withSuperAdminLoading, withDashboardLoading } from '@/components/loading'

// Automatic loading for super admin pages
const SuperAdminPage = withSuperAdminLoading(MyPage, {
  message: 'Loading admin data...',
  delay: 300
})

// Automatic loading for dashboard
const DashboardPage = withDashboardLoading(MyDashboard, {
  message: 'Loading dashboard...'
})
```

## Components Reference

### Universal Loaders

| Component | Description | Props |
|-----------|-------------|-------|
| `UniversalLoader` | Main loading wrapper | `isLoading`, `type`, `skeleton`, `message` |
| `SuperAdminLoader` | Super admin specific loader | `isLoading`, `skeleton`, `message` |
| `AdminLoader` | Admin specific loader | `isLoading`, `skeleton`, `message` |
| `MemberLoader` | Member specific loader | `isLoading`, `skeleton`, `message` |
| `DashboardLoader` | Dashboard metrics loader | `isLoading`, `skeleton` |
| `TableLoader` | Table data loader | `isLoading`, `rows`, `columns` |
| `FormLoader` | Form data loader | `isLoading`, `fields` |

### Skeleton Components

| Component | Description | Props |
|-----------|-------------|-------|
| `DashboardMetricsSkeleton` | Dashboard metrics skeleton | - |
| `TableSkeleton` | Table skeleton | `rows`, `columns` |
| `CardSkeleton` | Card skeleton | - |
| `ListSkeleton` | List skeleton | `items` |
| `ChartSkeleton` | Chart skeleton | - |
| `FormSkeleton` | Form skeleton | `fields` |
| `PageSkeleton` | Full page skeleton | - |

### Loading States

| Component | Description | Props |
|-----------|-------------|-------|
| `LoadingState` | Spinner with message | `message`, `size` |
| `Spinner` | Just spinner | `size` |
| `LoadingOverlay` | Overlay loading | `isLoading`, `message` |
| `LoadingButton` | Button with loading | `isLoading`, `loadingText` |

## Hooks Reference

### usePageLoading()

```tsx
const { 
  isLoading,     // boolean
  data,          // any
  error,         // string | null
  loadData,      // (loader: () => Promise<T>) => Promise<T>
  refresh,       // (loader: () => Promise<T>) => Promise<T>
  setData,       // (data: any) => void
  setError,      // (error: string | null) => void
  clearError     // () => void
} = usePageLoading()
```

### useApiLoading()

```tsx
const { 
  isLoading,     // boolean
  error,         // string | null
  execute,       // (apiCall, options) => Promise<T | null>
  setError,      // (error: string | null) => void
  clearError     // () => void
} = useApiLoading()
```

### useLoading()

```tsx
const { 
  isLoading,     // boolean
  loading,        // boolean (alias)
  setLoading,    // (loading: boolean) => void
  startLoading,  // () => void
  stopLoading,   // () => void
  withLoading    // <T>(asyncFn: () => Promise<T>) => Promise<T>
} = useLoading({ initialLoading: false, delay: 0 })
```

## Examples

### Super Admin Dashboard

```tsx
import { SuperAdminLoader, usePageLoading } from '@/components/loading'

export default function SuperAdminDashboard() {
  const { isLoading, data, error, loadData } = usePageLoading()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch('/super-admin/dashboard/overview')
      return response.data
    })
  }, [loadData])

  if (error) return <div className="text-red-600">{error}</div>

  return (
    <SuperAdminLoader isLoading={isLoading}>
      <div className="space-y-8">
        <h1>Super Admin Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </SuperAdminLoader>
  )
}
```

### Admin Table

```tsx
import { TableLoader, usePageLoading } from '@/components/loading'

export default function AdminMembers() {
  const { isLoading, data, loadData } = usePageLoading()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch('/admin/members')
      return response.data
    })
  }, [loadData])

  return (
    <TableLoader isLoading={isLoading} rows={10} columns={4}>
      <table>
        {/* Table content */}
      </table>
    </TableLoader>
  )
}
```

### Member Form

```tsx
import { FormLoader, useApiLoading } from '@/components/loading'

export default function MemberProfile() {
  const { isLoading, execute } = useApiLoading()
  const [formData, setFormData] = useState({})

  const handleSubmit = async () => {
    await execute(
      () => api.post('/member/profile', formData),
      {
        onSuccess: () => alert('Profile updated!'),
        onError: (error) => alert(`Error: ${error.message}`)
      }
    )
  }

  return (
    <FormLoader isLoading={isLoading} fields={5}>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </FormLoader>
  )
}
```

## Best Practices

1. **Use appropriate loaders** for different content types
2. **Provide meaningful loading messages** for better UX
3. **Handle errors gracefully** with proper error states
4. **Use delays** to prevent flickering for fast API calls
5. **Customize skeletons** to match your content structure
6. **Test loading states** during development

## Customization

### Custom Skeleton

```tsx
const CustomSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-muted animate-pulse rounded" />
    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
  </div>
)

<UniversalLoader 
  isLoading={isLoading}
  skeleton={<CustomSkeleton />}
>
  <Content />
</UniversalLoader>
```

### Custom Loading Message

```tsx
<SuperAdminLoader 
  isLoading={isLoading}
  message="Loading super admin data..."
>
  <Content />
</SuperAdminLoader>
```

This loading system provides a consistent, beautiful, and user-friendly loading experience across all areas of the smart housing platform! 🚀
