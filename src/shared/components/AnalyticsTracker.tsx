"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "vitaleevo_analytics_session";

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "anon";
    try {
        let sid = sessionStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid = "ve_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
            sessionStorage.setItem(SESSION_KEY, sid);
        }
        return sid;
    } catch {
        return "anon";
    }
}

function getDeviceType(): string {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    const ua = navigator.userAgent.toLowerCase();
    if (w < 768 || /mobile|iphone|ipod|android.*mobile/.test(ua)) return "mobile";
    if (w < 1024 || /ipad|tablet/.test(ua)) return "tablet";
    return "desktop";
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const pendingClicksRef = useRef<any[]>([]);
    const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
    const failedRef = useRef(0);
    const disabledRef = useRef(false);

    // Função para enviar os cliques acumulados para a API
    const flushClicks = useCallback(() => {
        if (disabledRef.current) return;
        if (pendingClicksRef.current.length === 0) return;
        const clicksToSend = [...pendingClicksRef.current];
        pendingClicksRef.current = [];

        const sessionId = getOrCreateSessionId();
        const payload = JSON.stringify({
            // Django espera {session_id, path, clicks} ou {type, path, session_id}; FastAPI aceita ambos
            session_id: sessionId,
            path: pathname,
            clicks: clicksToSend,
        });

        // Usa rota relativa via proxy Next.js para evitar CORS/404 direto no api.vitaleevo.ao
        const url = `/api/v1/analytics/track/`;

        const handleFail = () => {
            failedRef.current += 1;
            if (failedRef.current >= 3) disabledRef.current = true;
        };

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            try {
                const blob = new Blob([payload], { type: "application/json" });
                const ok = navigator.sendBeacon(url, blob);
                if (!ok) handleFail();
            } catch {
                handleFail();
            }
        } else {
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            }).then(r => {
                if (!r.ok) handleFail();
                else failedRef.current = 0;
            }).catch(handleFail);
        }
    }, [pathname]);

    // 1. Rastrear Pageview em cada mudança de rota (exceto /admin)
    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) return;

        // Despejar cliques da página anterior antes de registar a nova
        flushClicks();

        const sessionId = getOrCreateSessionId();
        const deviceType = getDeviceType();
        const screenRes = typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "";

        // Enviar pageview via proxy relativo (evita 401/404 direto no api.vitaleevo.ao)
        if (disabledRef.current) return;
        // Payload compatível Django (pageview dentro de batch) e FastAPI (type)
        fetch(`/api/v1/analytics/track/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                path: pathname,
                pageview: {
                    referrer: typeof document !== "undefined" ? document.referrer : "",
                    device_type: deviceType,
                    screen_resolution: screenRes,
                },
                // Fallback FastAPI: type + campos soltos
                type: "pageview",
                referrer: typeof document !== "undefined" ? document.referrer : "",
                device_type: deviceType,
                screen_resolution: screenRes,
            }),
            keepalive: true,
        }).then(r => {
            if (!r.ok) {
                failedRef.current += 1;
                if (failedRef.current >= 3) disabledRef.current = true;
            } else failedRef.current = 0;
        }).catch(() => {
            failedRef.current += 1;
            if (failedRef.current >= 3) disabledRef.current = true;
        });
    }, [flushClicks, pathname]);

    // 2. Rastrear cliques em botões, links e elementos com coordenadas (X, Y)
    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) return;

        const handleClick = (e: MouseEvent) => {
            try {
                const target = e.target as HTMLElement | null;
                if (!target) return;

                // Encontrar elemento interativo mais próximo ou o próprio alvo
                const interactive = target.closest("button, a, input, select, textarea, [role='button'], [tabindex]") as HTMLElement | null;
                const el = interactive || target;

                // Extrair texto ou identificador limpo
                const rawText = el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("alt") || el.getAttribute("placeholder") || "";
                const cleanText = rawText.trim().replace(/\s+/g, " ").slice(0, 100);

                const elementId = el.id || "";
                const elementTag = el.tagName.toLowerCase();

                // Calcular coordenadas em percentagem da janela visível (viewport)
                const vw = window.innerWidth || 1920;
                const vh = window.innerHeight || 1080;
                const xPercent = Math.min(100, Math.max(0, Math.round((e.clientX / vw) * 1000) / 10));
                const yPercent = Math.min(100, Math.max(0, Math.round((e.clientY / vh) * 1000) / 10));

                pendingClicksRef.current.push({
                    path: pathname,
                    element_tag: elementTag,
                    element_id: elementId,
                    element_text: cleanText || (elementId ? `#${elementId}` : `<${elementTag}>`),
                    x_percent: xPercent,
                    y_percent: yPercent,
                    viewport_width: vw,
                    viewport_height: vh,
                });

                // Agendar envio com debounce de 3 segundos
                if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
                flushTimerRef.current = setTimeout(flushClicks, 3000);
            } catch {
                // silencioso
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                flushClicks();
            }
        };

        window.addEventListener("click", handleClick, { passive: true, capture: true });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        // beforeunload é bloqueado por Permissions-Policy (unload) e gera violation; usar pagehide
        window.addEventListener("pagehide", flushClicks);

        return () => {
            window.removeEventListener("click", handleClick, { capture: true });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", flushClicks);
            if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
            flushClicks();
        };
    }, [flushClicks, pathname]);

    return null;
}
