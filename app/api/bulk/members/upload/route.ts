import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()
export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    
    // Get headers from request
    const authHeader = request.headers.get('Authorization') || ''
    const host = request.headers.get('host') || ''
    const tenantSlug = request.headers.get('X-Tenant-Slug') || ''
    
    // Call Laravel API directly for bulk upload
    const res = await fetch(`${API_BASE_URL}/admin/bulk/members/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
        'X-Forwarded-Host': host,
        ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ 
        success: false,
        message: 'Upload failed',
        errors: ['Unable to process the upload request. Please try again.'],
        error_type: 'server_error'
      }))
      
      // Forward the error details from Laravel API
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to upload members',
          errors: errorData.errors || [errorData.message || 'Upload failed'],
          error_type: errorData.error_type || 'unknown_error',
          ...(errorData.total_rows && { total_rows: errorData.total_rows }),
          ...(errorData.error_count && { error_count: errorData.error_count }),
          ...(errorData.data && { data: errorData.data })
        },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}




