import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { auth } from '@/auth';

type SessionUser = {
  accessToken?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  const accessToken = (session?.user as SessionUser | undefined)?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'You must be signed in to upload photos.' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files');
  const metadataRaw = formData.get('metadata');

  if (files.length === 0) {
    return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
  }

  const invalid = files.some((item) => !(item instanceof File));
  if (invalid) {
    return NextResponse.json({ error: 'Only file uploads are supported' }, { status: 400 });
  }

  if (metadataRaw && typeof metadataRaw !== 'string') {
    return NextResponse.json({ error: 'Metadata must be a JSON string' }, { status: 400 });
  }

  const upstreamFormData = new FormData();
  files.forEach((file) => {
    upstreamFormData.append('files', file as File);
  });

  if (typeof metadataRaw === 'string') {
    upstreamFormData.append('metadata', metadataRaw);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: upstreamFormData,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = isJson && payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error: string }).error
        : typeof payload === 'string'
            ? payload
            : 'Upload failed';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 },
    );
  }
}