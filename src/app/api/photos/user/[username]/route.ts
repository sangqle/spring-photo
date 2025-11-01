import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

import type { Photo } from '@/types/photo';

const FALLBACK_PHOTOS: Record<string, Photo[]> = {
  photographer1: [
    {
      id: 'demo-shot-1',
      username: 'photographer1',
      title: 'Blue Hour Overlook',
      description: 'City lights emerging under a violet dusk, captured from the old viaduct.',
      url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80',
      createdAt: '2024-01-12T18:45:00.000Z',
      metadata: {
        width: 2048,
        height: 1365,
        cameraMake: 'Fujifilm',
        cameraModel: 'X-T5',
        location: 'Seattle, USA',
      },
    },
    {
      id: 'demo-shot-2',
      username: 'photographer1',
      title: 'Quiet Commute',
      description: 'A single rider illuminated by subway lights during the morning rush.',
      url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1800&q=80',
      createdAt: '2024-02-05T13:10:00.000Z',
      metadata: {
        width: 2000,
        height: 1333,
        cameraMake: 'Sony',
        cameraModel: 'A7 IV',
        location: 'New York, USA',
      },
    },
    {
      id: 'demo-shot-3',
      username: 'photographer1',
      title: 'Rainy Reflections',
      description: 'Street reflections creating mirrored trails of neon signage.',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80',
      createdAt: '2024-03-21T21:05:00.000Z',
      metadata: {
        width: 2048,
        height: 1365,
        cameraMake: 'Canon',
        cameraModel: 'EOS R5',
        location: 'Tokyo, Japan',
      },
    },
  ],
  photographer2: [
    {
      id: 'demo-landscape-1',
      username: 'photographer2',
      title: 'Sierra Dawn',
      description: 'Soft alpine light painting a solitary peak before sunrise.',
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=80',
      createdAt: '2024-01-04T06:30:00.000Z',
      metadata: {
        width: 2048,
        height: 1365,
        cameraMake: 'Nikon',
        cameraModel: 'Z7 II',
        location: 'Sierra Nevada, USA',
      },
    },
    {
      id: 'demo-landscape-2',
      username: 'photographer2',
      title: 'Tide Whisper',
      description: 'Long exposure capturing the retreat of waves on a basalt shoreline.',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
      createdAt: '2024-04-17T09:20:00.000Z',
      metadata: {
        width: 2048,
        height: 1280,
        cameraMake: 'Fujifilm',
        cameraModel: 'GFX 100S',
        location: 'Reynisfjara, Iceland',
      },
    },
  ],
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

export async function GET(request: NextRequest, context: RouteParams) {
  const resolvedParams = await context.params;
  const sanitizedUsername = sanitizeUsername(resolvedParams?.username);

  if (!sanitizedUsername) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const lookupKey = sanitizedUsername.toLowerCase();
  const fallbackPhotos = FALLBACK_PHOTOS[lookupKey];

  try {
  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  searchParams.set('username', sanitizedUsername);
  const upstreamUrl = `${API_BASE_URL}/api/photos/public?${searchParams.toString()}`;

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
              : `Unable to load photos for ${sanitizedUsername}`;

      if (response.status === 404 && fallbackPhotos) {
        return NextResponse.json(buildFallbackPagedResponse(fallbackPhotos, request.nextUrl.searchParams), {
          status: 200,
        });
      }

      const status = response.status === 404 ? 404 : response.status;
      return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (fallbackPhotos) {
      return NextResponse.json(buildFallbackPagedResponse(fallbackPhotos, request.nextUrl.searchParams), {
        status: 200,
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load photos.' },
      { status: 500 },
    );
  }
}

const buildFallbackPagedResponse = (photos: Photo[], search: URLSearchParams) => {
  const pageParam = search.get('page');
  const sizeParam = search.get('size');

  const page = pageParam ? Math.max(parseInt(pageParam, 10) || 0, 0) : 0;
  const size = sizeParam ? Math.max(parseInt(sizeParam, 10) || 20, 1) : 20;

  const start = page * size;
  const end = start + size;
  const slice = photos.slice(start, end);
  const totalPages = Math.ceil(photos.length / size) || 1;

  return {
    content: slice,
    page,
    totalPages,
    totalElements: photos.length,
    last: page >= totalPages - 1,
  };
};
