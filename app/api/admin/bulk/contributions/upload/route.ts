import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const authHeader = request.headers.get('Authorization') || ''
    const host = request.headers.get('host') || ''
    const tenantSlug = request.headers.get('X-Tenant-Slug') || ''
    
    const res = await fetch(`${API_BASE_URL}/admin/bulk/contributions/upload`, {
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
      const errorData = await res.json().catch(() => ({ message: 'Upload failed' }))
      return NextResponse.json(
        { success: false, error: 'Failed to upload contributions', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bulk contributions upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

