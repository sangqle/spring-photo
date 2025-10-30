import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { auth } from '@/auth';

type SessionUser = {
  accessToken?: string;
};

export async function GET(request: NextRequest) {
  const session = await auth();
  const accessToken = (session?.user as SessionUser | undefined)?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'You must be signed in to view your photos.' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const upstreamUrl = `${API_BASE_URL}/api/photos/my-photos${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
              : 'Unable to load your photos';

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load your photos' },
      { status: 500 },
    );
  }
}
