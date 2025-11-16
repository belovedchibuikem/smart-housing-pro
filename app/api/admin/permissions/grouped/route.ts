import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"

const apiBase = getApiBaseUrl()

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${apiBase}/permissions/grouped`, {
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