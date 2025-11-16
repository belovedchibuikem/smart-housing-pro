import { NextRequest, NextResponse } from 'next/server'
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()
export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    
    // Call Laravel API directly for bulk upload
    const res = await fetch(`${API_BASE_URL}/bulk/members/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to upload members', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




