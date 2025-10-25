"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UniversalLoader,
  DashboardLoader,
  TableLoader,
  FormLoader,
  LoadingState,
  Spinner,
  LoadingOverlay,
  LoadingButton,
  DashboardMetricsSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  ChartSkeleton,
  FormSkeleton,
  PageSkeleton
} from './index'

export function LoadingDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<string>('')

  const simulateLoading = (type: string) => {
    setLoadingType(type)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Loading System Demo</h1>
        <p className="text-muted-foreground">
          Universal loading components for Super Admin, Admin, and Member areas
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => simulateLoading('page')} variant="outline">
              Page Loading
            </Button>
            <Button onClick={() => simulateLoading('dashboard')} variant="outline">
              Dashboard Loading
            </Button>
            <Button onClick={() => simulateLoading('table')} variant="outline">
              Table Loading
            </Button>
            <Button onClick={() => simulateLoading('form')} variant="outline">
              Form Loading
            </Button>
            <Button onClick={() => simulateLoading('spinner')} variant="outline">
              Spinner Only
            </Button>
            <Button onClick={() => simulateLoading('overlay')} variant="outline">
              Loading Overlay
            </Button>
            <Button onClick={() => setIsLoading(false)} variant="destructive">
              Stop Loading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Universal Loader Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Universal Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <UniversalLoader 
            isLoading={isLoading && loadingType === 'page'}
            type="page"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Page Content</h3>
              <p>This is the actual page content that appears when loading is complete.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded">Card 1</div>
                <div className="p-4 border rounded">Card 2</div>
                <div className="p-4 border rounded">Card 3</div>
              </div>
            </div>
          </UniversalLoader>
        </CardContent>
      </Card>

      {/* Dashboard Loader Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardLoader isLoading={isLoading && loadingType === 'dashboard'}>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold">Total Users</h4>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold">Revenue</h4>
                <p className="text-2xl font-bold">₦45.2M</p>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold">Active Loans</h4>
                <p className="text-2xl font-bold">156</p>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold">Properties</h4>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </DashboardLoader>
        </CardContent>
      </Card>

      {/* Table Loader Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Table Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <TableLoader isLoading={isLoading && loadingType === 'table'} rows={5} columns={4}>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">John Doe</td>
                  <td className="p-2">john@example.com</td>
                  <td className="p-2">Admin</td>
                  <td className="p-2">Active</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Jane Smith</td>
                  <td className="p-2">jane@example.com</td>
                  <td className="p-2">Member</td>
                  <td className="p-2">Active</td>
                </tr>
              </tbody>
            </table>
          </TableLoader>
        </CardContent>
      </Card>

      {/* Form Loader Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Form Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <FormLoader isLoading={isLoading && loadingType === 'form'} fields={4}>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input className="w-full p-2 border rounded" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="w-full p-2 border rounded" placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full p-2 border rounded" placeholder="Enter phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full p-2 border rounded" placeholder="Enter address" />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </FormLoader>
        </CardContent>
      </Card>

      {/* Spinner Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner & Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
            
            {isLoading && loadingType === 'spinner' && (
              <LoadingState message="Loading data..." />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Overlay</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingOverlay isLoading={isLoading && loadingType === 'overlay'}>
            <div className="p-8 border-2 border-dashed border-muted rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Content with Overlay</h4>
              <p className="text-muted-foreground">
                This content will be overlaid with a loading spinner when loading is active.
              </p>
            </div>
          </LoadingOverlay>
        </CardContent>
      </Card>

      {/* Loading Button Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Button</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <LoadingButton 
              isLoading={isLoading && loadingType === 'button'}
              loadingText="Processing..."
              onClick={() => simulateLoading('button')}
            >
              Click to Load
            </LoadingButton>
            
            <Button 
              onClick={() => simulateLoading('button')}
              disabled={isLoading && loadingType === 'button'}
            >
              Regular Button
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Components Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Skeleton Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Dashboard Metrics Skeleton</h4>
              <DashboardMetricsSkeleton />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Table Skeleton</h4>
              <TableSkeleton rows={3} columns={4} />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Card Skeleton</h4>
              <CardSkeleton />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">List Skeleton</h4>
              <ListSkeleton items={3} />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Chart Skeleton</h4>
              <ChartSkeleton />
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Form Skeleton</h4>
              <FormSkeleton fields={3} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
