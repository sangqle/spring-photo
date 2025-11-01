import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { auth } from '@/auth';

type MaybePromise<T> = T | Promise<T>;

type RouteParams = {
  params: MaybePromise<{
    photoId?: string;
  }>;
};

type SessionUser = {
  accessToken?: string;
};

const normalizeErrorMessage = (payload: unknown): string => {
  if (!payload) {
    return 'Failed to update like status';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object') {
    const record = payload as { error?: string; message?: string };
    if (record.error) {
      return record.error;
    }
    if (record.message) {
      return record.message;
    }
  }

  return 'Failed to update like status';
};

const pickAccessToken = async (): Promise<string | null> => {
  const session = await auth();
  return ((session?.user as SessionUser | undefined)?.accessToken) ?? null;
};

const buildUpstreamUrl = (photoId: string) =>
  `${API_BASE_URL}/api/likes/photos/${encodeURIComponent(photoId)}`;

const buildQueryFallbackUrl = (photoId: string) =>
  `${API_BASE_URL}/api/likes/photos?photoId=${encodeURIComponent(photoId)}`;

const extractPhotoId = async (
  input: Request,
  context: MaybePromise<RouteParams>,
): Promise<string | null> => {
  const resolvedContext = context instanceof Promise ? await context : context;

  const paramsLike = resolvedContext?.params;
  const resolvedParams = paramsLike instanceof Promise ? await paramsLike : paramsLike;
  const contextValue = resolvedParams?.photoId;

  if (contextValue && contextValue.trim()) {
    return contextValue.trim();
  }

  try {
    const url = new URL(input.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const candidate = segments[segments.length - 1];
    if (candidate && candidate.toLowerCase() !== 'photos') {
      return candidate;
    }
  } catch {
    // Swallow URL parse failures; null will be returned below.
  }

  return null;
};

const sendUpstream = async (
  url: string,
  method: 'GET' | 'POST',
  accessToken: string,
) => {
  const upstreamResponse = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const contentType = upstreamResponse.headers.get('content-type') ?? '';
  const expectsJson = contentType.includes('application/json');
  const payload = expectsJson ? await upstreamResponse.json() : await upstreamResponse.text();

  return { upstreamResponse, expectsJson, payload } as const;
};

const forwardRequest = async (
  input: Request,
  context: MaybePromise<RouteParams>,
  method: 'GET' | 'POST',
): Promise<NextResponse> => {
  const photoId = await extractPhotoId(input, context);

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
  }

  const accessToken = await pickAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'You must be signed in to like photos.' }, { status: 401 });
  }

  const upstreamUrl = buildUpstreamUrl(photoId);

  try {
    let { upstreamResponse, expectsJson, payload } = await sendUpstream(upstreamUrl, method, accessToken);

    if (!upstreamResponse.ok && method === 'GET') {
      const errorMessage = normalizeErrorMessage(payload);
      if (upstreamResponse.status === 400 && errorMessage.toLowerCase().includes('photo id is required')) {
        ({ upstreamResponse, expectsJson, payload } = await sendUpstream(
          buildQueryFallbackUrl(photoId),
          method,
          accessToken,
        ));
      } else {
        return NextResponse.json({ error: errorMessage }, { status: upstreamResponse.status });
      }
    }

    if (!upstreamResponse.ok) {
      const errorMessage = normalizeErrorMessage(payload);
      return NextResponse.json({ error: errorMessage }, { status: upstreamResponse.status });
    }

    if (expectsJson) {
      return NextResponse.json(payload, { status: upstreamResponse.status });
    }

    return NextResponse.json({ data: payload }, { status: upstreamResponse.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update like status' },
      { status: 500 },
    );
  }
};

export async function POST(_request: Request, context: MaybePromise<RouteParams>) {
  return forwardRequest(_request, context, 'POST');
}

export async function GET(request: Request, context: MaybePromise<RouteParams>) {
  return forwardRequest(request, context, 'GET');
}
