import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8100').replace(/\/$/, '') + '/api/v1';

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathJoined = path.join("/");
    const pathWithSlash = pathJoined.endsWith("/") ? pathJoined : `${pathJoined}/`;
    const search = req.nextUrl.search || "";
    const targetUrl = `${DJANGO_API_BASE}/${pathWithSlash}${search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        const k = key.toLowerCase();
        if (k !== "host" && k !== "connection" && k !== "content-length" && k !== "content-encoding" && k !== "accept-encoding") {
            headers[key] = value;
        }
    });

    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        try {
            const text = await req.text();
            if (text) {
                body = text;
            }
        } catch {
            body = undefined;
        }
    }

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body,
        });

        const resHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            if (k !== "content-encoding" && k !== "content-length" && k !== "transfer-encoding") {
                resHeaders[key] = value;
            }
        });

        const data = await response.arrayBuffer();
        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: resHeaders,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: 'Erro de ligacao ao backend interno', details: err?.message },
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
