import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${params.id}/toggle-status`, {
      method: 'POST',
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
    console.error('Toggle Role Status API Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle role status' },
      { status: 500 }
    );
  }
}