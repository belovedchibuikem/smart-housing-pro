import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Call Laravel API directly for template
    const laravelApiUrl = "http://127.0.0.1:8000/api"
    
    const res = await fetch(`${laravelApiUrl}/bulk/members/template`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
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




