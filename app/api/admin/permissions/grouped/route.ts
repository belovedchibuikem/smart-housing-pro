import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/permissions/grouped`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Grouped Permissions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grouped permissions' },
      { status: 500 }
    );
  }
}