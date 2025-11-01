import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

type FallbackUser = {
  username: string;
  name?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  profile?: {
    bio?: string | null;
    avatarUrl?: string | null;
    displayName?: string | null;
  };
};

const FALLBACK_USERS: Record<string, FallbackUser> = {
  photographer1: {
    username: 'photographer1',
    displayName: 'Alex Lensworth',
    bio: 'Documentary photographer capturing everyday magic in urban spaces.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=200&h=200&q=80',
  },
  photographer2: {
    username: 'photographer2',
    displayName: 'Morgan Rivers',
    bio: 'Landscape explorer focused on dramatic light and weathered terrains.',
    avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=200&h=200&q=80',
  },
};

const sanitizeUsername = (raw: string | undefined): string | null => {
  if (!raw) {
    return null;
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  const trimmed = decoded.trim();

  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN') {
    return null;
  }

  return trimmed;
};

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  const resolvedParams = await context.params;
  const cleanedUsername = sanitizeUsername(resolvedParams?.username);

  if (!cleanedUsername) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const lookupKey = cleanedUsername.toLowerCase();
  const fallbackUser = FALLBACK_USERS[lookupKey];

  try {
    const upstreamUrl = `${API_BASE_URL}/api/photos/users/${encodeURIComponent(cleanedUsername)}`;
    const response = await fetch(upstreamUrl, { cache: 'no-store' });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        isJson && payload && typeof payload === 'object' && 'error' in payload
          ? (payload as { error?: string; message?: string }).error ?? (payload as { message?: string }).message
          : typeof payload === 'string'
              ? payload
              : `Unable to load profile for ${cleanedUsername}`;

      if (response.status === 404 && fallbackUser) {
        return NextResponse.json(fallbackUser, { status: 200 });
      }

      const status = response.status === 404 ? 404 : response.status;
      return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (fallbackUser) {
      return NextResponse.json(fallbackUser, { status: 200 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load profile.' },
      { status: 500 },
    );
  }
}
