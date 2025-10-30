import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { shareId } = await request.json();

    // Logic to handle sharing a photo
    // This could involve fetching the photo details from a database
    // and returning them in the response.

    return NextResponse.json({ message: 'Photo shared successfully', shareId });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    // Logic to retrieve the shared photo details using the shareId
    // This could involve fetching the photo from a database.

    return NextResponse.json({ message: 'Shared photo details', shareId });
}