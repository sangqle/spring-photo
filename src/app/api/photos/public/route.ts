import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos/public`, {
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        isJson && payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string; message?: string }).error ?? (payload as { message?: string }).message
          : typeof payload === 'string'
              ? payload
              : 'Unable to load public photos';

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load public photos' },
      { status: 500 },
    );
  }
}
