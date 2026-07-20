import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()

async function parseUpstreamResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: `Upstream returned non-JSON response (${response.status})`,
      details: text.slice(0, 500),
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/permissions${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
    });

    if (!response.ok) {
      const errorData = await parseUpstreamResponse(response);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await parseUpstreamResponse(response);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Permissions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${API_BASE_URL.replace(/\/$/, '')}/admin/permissions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'X-Forwarded-Host': request.headers.get('x-forwarded-host') || request.headers.get('host') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await parseUpstreamResponse(response);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await parseUpstreamResponse(response);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Create Permission API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}