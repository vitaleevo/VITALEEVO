import { NextRequest, NextResponse } from 'next/server';

const DJANGO_MEDIA_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8100').replace(/\/$/, '') + '/media';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathStr = path.join("/");
    const targetUrl = `${DJANGO_MEDIA_BASE}/${pathStr}`;

    try {
        const response = await fetch(targetUrl);
        const resHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            resHeaders[key] = value;
        });
        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });
    } catch {
        return new NextResponse('Media not found', { status: 404 });
    }
}
