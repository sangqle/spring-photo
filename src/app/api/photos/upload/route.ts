import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

  let metadata: unknown = null;
  if (metadataRaw && typeof metadataRaw === 'string') {
    try {
      metadata = JSON.parse(metadataRaw);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid metadata payload' }, { status: 400 });
    }
  }

  // File persistence should happen here.
  // For now we simply respond with a summary of what would be stored.
  const responsePayload = {
    message: 'Files uploaded successfully',
    count: files.length,
    metadata,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}