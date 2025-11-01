import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laravelApiUrl = "http://127.0.0.1:8000/api"
    
    const res = await fetch(`${laravelApiUrl}/users/${params.id}/toggle-status`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json(
        { error: 'Failed to toggle user status', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('User status toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




