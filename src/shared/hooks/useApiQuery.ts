"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../utils/apiClient";

interface ApiQueryOptions {
    enabled?: boolean;
    params?: Record<string, string | number | boolean | undefined | null>;
    token?: string | null;
    /** Fetch custom (adaptadores apiClient) — substitui o path. */
    fetcher?: () => Promise<unknown>;
    /** Dependências do fetcher — sem elas o efeito não recorre a cada render. */
    deps?: unknown[];
}

interface ApiQueryState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Substituto do useQuery do Convex — faz fetch à API Django e devolve
 * { data, isLoading, error, refetch } com o mesmo contrato de uso.
 */
export function useApiQuery<T = unknown>(path: string | null, options: ApiQueryOptions = {}): ApiQueryState<T> {
    const { enabled = true, params, token, fetcher, deps = [] } = options;
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!!path && enabled);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        if ((!path && !fetcherRef.current) || !enabled) {
            setData(null);
            setIsLoading(false);
            return;
        }
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        const run = fetcherRef.current
            ? fetcherRef.current()
            : request<T>(path as string, { params, auth: !!token, token });

        run.then(result => {
            if (!controller.signal.aborted) {
                setData(result as T);
                setIsLoading(false);
            }
        }).catch(err => {
            if (!controller.signal.aborted) {
                setData(null);
                setError(err instanceof Error ? err.message : "Erro ao carregar dados");
                setIsLoading(false);
            }
        });

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, enabled, tick, token, ...deps]);

    const refetch = useCallback(() => setTick(t => t + 1), []);

    return { data, isLoading, error, refetch };
}

/**
 * Conta para páginas paginadas (admin) — busca com page_size fixo.
 */
export function useApiPagination<T = unknown>(
    path: string | null,
    page: number,
    options: ApiQueryOptions = {}
): ApiQueryState<T> & { page: number } {
    const state = useApiQuery<T>(path, { ...options, params: { ...options.params, page, page_size: options.params?.page_size ?? 10 } });
    return { ...state, page };
}