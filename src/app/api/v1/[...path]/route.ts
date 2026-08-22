import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8100').replace(/\/$/, '') + '/api/v1';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REQUEST_BYTES = 16 * 1024 * 1024;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024;
const REQUEST_HEADERS = new Set(['accept', 'authorization', 'content-type', 'if-none-match', 'x-request-id']);
const RESPONSE_HEADERS = new Set([
    'cache-control', 'content-disposition', 'content-type', 'etag', 'last-modified', 'retry-after', 'x-request-id',
]);

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathJoined = path.join("/");
    const pathWithSlash = pathJoined.endsWith("/") ? pathJoined : `${pathJoined}/`;
    const search = req.nextUrl.search || "";
    const targetUrl = `${DJANGO_API_BASE}/${pathWithSlash}${search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        if (REQUEST_HEADERS.has(key.toLowerCase())) {
            headers[key] = value;
        }
    });

    let body: ArrayBuffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        const declaredLength = Number(req.headers.get('content-length') || 0);
        if (declaredLength > MAX_REQUEST_BYTES) {
            return NextResponse.json({ error: 'Pedido demasiado grande.' }, { status: 413 });
        }
        body = await req.arrayBuffer();
        if (body.byteLength > MAX_REQUEST_BYTES) {
            return NextResponse.json({ error: 'Pedido demasiado grande.' }, { status: 413 });
        }
    }

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        const declaredLength = Number(response.headers.get('content-length') || 0);
        if (declaredLength > MAX_RESPONSE_BYTES) {
            return NextResponse.json({ error: 'Resposta do backend demasiado grande.' }, { status: 502 });
        }

        const resHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            if (RESPONSE_HEADERS.has(key.toLowerCase())) {
                resHeaders[key] = value;
            }
        });

        const data = await response.arrayBuffer();
        if (data.byteLength > MAX_RESPONSE_BYTES) {
            return NextResponse.json({ error: 'Resposta do backend demasiado grande.' }, { status: 502 });
        }
        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: resHeaders,
        });
    } catch {
        return NextResponse.json(
            { error: 'Backend temporariamente indisponível.' },
            { status: 502 }
        );
    }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
