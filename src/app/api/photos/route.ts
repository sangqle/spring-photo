import { NextResponse } from 'next/server';
import { getPhotos, createPhoto } from '@/lib/api-client';

export async function GET() {
  const photos = await getPhotos();
  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  const photoData = await request.json();
  const newPhoto = await createPhoto(photoData);
  return NextResponse.json(newPhoto, { status: 201 });
}