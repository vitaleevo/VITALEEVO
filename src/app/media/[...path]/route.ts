import { NextRequest, NextResponse } from 'next/server';

const DJANGO_MEDIA_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8100').replace(/\/$/, '') + '/media';
const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathStr = path.join("/");
    const targetUrl = `${DJANGO_MEDIA_BASE}/${pathStr}`;

    try {
        const response = await fetch(targetUrl, { signal: AbortSignal.timeout(10_000) });
        const declaredLength = Number(response.headers.get('content-length') || 0);
        if (declaredLength > MAX_MEDIA_BYTES) {
            return new NextResponse('Media too large', { status: 502 });
        }
        const resHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            if (['cache-control', 'content-type', 'etag', 'last-modified'].includes(key.toLowerCase())) {
                resHeaders[key] = value;
            }
        });
        const data = await response.arrayBuffer();
        if (data.byteLength > MAX_MEDIA_BYTES) {
            return new NextResponse('Media too large', { status: 502 });
        }
        return new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });
    } catch {
        return new NextResponse('Media not found', { status: 404 });
    }
}
