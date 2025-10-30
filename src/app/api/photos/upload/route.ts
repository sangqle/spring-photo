import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  // Here you would typically handle the file upload logic, e.g., saving to a cloud storage
  // For demonstration, we'll just return a success response

  return NextResponse.json({ message: 'File uploaded successfully' }, { status: 200 });
}