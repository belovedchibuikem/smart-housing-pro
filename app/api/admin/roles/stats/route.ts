import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/stats`, {
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
    console.error('Roles Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role statistics' },
      { status: 500 }
    );
  }
}