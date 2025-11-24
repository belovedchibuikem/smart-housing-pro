import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from "@/lib/api/config"

export async function GET(request: NextRequest) {
  try {
    // Call Laravel API directly for template
    const laravelApiUrl = getApiBaseUrl()
    const authHeader = request.headers.get('Authorization') || ''
    const host = request.headers.get('host') || ''
    const tenantSlug = request.headers.get('X-Tenant-Slug') || ''
    
    const res = await fetch(`${laravelApiUrl}/admin/bulk/members/template`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'X-Forwarded-Host': host,
        ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch template' }))
      return NextResponse.json(
        { error: 'Failed to fetch template', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    
    // Return CSV content as downloadable file
    return new NextResponse(data.template, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${data.filename}"`,
      },
    })
  } catch (error) {
    console.error('Template fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




