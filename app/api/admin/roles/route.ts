import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

const API_BASE_URL = getApiBaseUrl()

function proxyHeaders(request: NextRequest): Record<string, string> {
  return {
    ...buildTenantForwardHeaders(request),
    'Content-Type': 'application/json',
    Authorization: request.headers.get('Authorization') || '',
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${API_BASE_URL}/admin/roles?${queryString}`, {
      method: 'GET',
      headers: proxyHeaders(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Roles API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      method: 'POST',
      headers: proxyHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Create Role API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}