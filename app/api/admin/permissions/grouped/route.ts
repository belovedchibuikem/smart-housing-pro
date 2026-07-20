import { NextRequest, NextResponse } from 'next/server';

import { getApiBaseUrl } from "@/lib/api/config"

const apiBase = getApiBaseUrl()

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
    const response = await fetch(`${apiBase.replace(/\/$/, '')}/admin/permissions/grouped`, {
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
    console.error('Grouped Permissions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grouped permissions' },
      { status: 500 }
    );
  }
}