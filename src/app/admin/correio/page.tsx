"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Inbox, LogOut, Mail, RefreshCw, Send, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

type Account = "info" | "alexandre";
type Status = { authenticated: boolean; serviceReady: boolean; accounts: Record<Account, boolean> };
type MessageSummary = { uid: string; from: string; subject: string; date: string };
type MessageDetails = MessageSummary & { to: string; body: string };
type ApiFailure = { error?: string };
const ENDPOINT = "/api/vitaleevo_correio";
const ADDRESSES: Record<Account, string> = {
    info: "info@vitaleevo.ao",
    alexandre: "alexandre.macosso@vitaleevo.ao",
};

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
    const data = (await res.json()) as T & ApiFailure;
    if (!res.ok) throw new Error(data.error || "Operação indisponível");
    return data;
}
function post<T>(mode: string, payload: Record<string, unknown> = {}) {
    return jsonRequest<T>(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...payload }),
    });
}

export default function CorreioAdminPage() {
    const [status, setStatus] = useState<Status | null>(null);
    const [password, setPassword] = useState("");
    const [account, setAccount] = useState<Account>("info");
    const [messages, setMessages] = useState<MessageSummary[]>([]);
    const [selected, setSelected] = useState<MessageDetails | null>(null);
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [working, setWorking] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const refreshStatus = useCallback(async () => {
        try {
            const result = await jsonRequest<Status>(ENDPOINT + "?mode=status");
            setStatus(result);
        } catch {
            setError("Não foi possível contactar o serviço de correio na Vercel.");
        }
    }, []);

    useEffect(() => { void refreshStatus(); }, [refreshStatus]);

    const loadInbox = useCallback(async (selectedAccount: Account) => {
        setLoadingMessages(true);
        setError("");
        setSelected(null);
        try {
            const data = await jsonRequest<{ messages: MessageSummary[] }>(
                ENDPOINT + "?mode=list&account=" + encodeURIComponent(selectedAccount),
            );
            setMessages(data.messages);
        } catch (e) {
            setMessages([]);
            setError(e instanceof Error ? e.message : "Erro ao obter mensagens");
        } finally { setLoadingMessages(false); }
    }, []);

    useEffect(() => {
        if (status?.authenticated && status.accounts[account]) void loadInbox(account);
    }, [status?.authenticated, status?.accounts, account, loadInbox]);

    async function login(event: FormEvent) {
        event.preventDefault();
        setWorking(true); setError("");
        try {
            await post("login", { password });
            setPassword("");
            await refreshStatus();
        } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível iniciar sessão"); }
        finally { setWorking(false); }
    }

    async function logout() {
        setWorking(true);
        try {
            await post("logout");
            setMessages([]); setSelected(null); setStatus(current => current ? { ...current, authenticated: false } : null);
        } finally { setWorking(false); }
    }

    async function read(uid: string) {
        setWorking(true); setError(""); setNotice("");
        try {
            const data = await jsonRequest<{ message: MessageDetails }>(
                ENDPOINT + "?mode=read&account=" + encodeURIComponent(account) + "&uid=" + encodeURIComponent(uid),
            );
            setSelected(data.message);
        } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível abrir mensagem"); }
        finally { setWorking(false); }
    }

    async function send(event: FormEvent) {
        event.preventDefault();
        if (!window.confirm("Confirmas o envio desta mensagem de " + ADDRESSES[account] + " para " + to + "?")) return;
        setWorking(true); setError(""); setNotice("");
        try {
            const result = await post<{ sent: boolean; note: string }>("send", {
                account, to, subject, body, confirmed: true,
            });
            if (result.sent) {
                setNotice("Enviado por SMTP. " + result.note);
                setTo(""); setSubject(""); setBody("");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Falha no envio");
        } finally { setWorking(false); }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] p-4 sm:p-8">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <Link href="/" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline">
                            <ArrowLeft size={14} /> Vitaleevo
                        </Link>
                        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white"><Mail /> Correio Empresarial</h1>
                        <p className="mt-1 text-sm text-slate-500">Área interna • Contas cPanel • Vercel</p>
                    </div>
                    {status?.authenticated && (
                        <button type="button" onClick={() => void logout()} disabled={working}
                            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
                            <LogOut size={16} /> Terminar sessão
                        </button>
                    )}
                </header>

                {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle size={18} className="shrink-0" /> {error}
                </div>}
                {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

                {!status ? <p className="text-sm text-slate-600">A verificar configuração...</p> :
                !status.serviceReady ? (
                    <div className="rounded-2xl border bg-white p-6 dark:bg-slate-900">
                        <h2 className="font-bold">Configuração privada pendente</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Configure VMAIL_ADMIN_PASSWORD (mínimo 16 caracteres) e VMAIL_SESSION_SECRET (mínimo 32)
                            nas variáveis privadas da Vercel. Nenhuma palavra-passe deve ser inserida no código.
                        </p>
                    </div>
                ) : !status.authenticated ? (
                    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
                        <div className="mb-4 flex items-center gap-2 text-violet-600"><ShieldCheck /> <h2 className="font-bold">Acesso reservado</h2></div>
                        <form onSubmit={login} className="space-y-4">
                            <label className="block text-sm font-medium">Palavra-passe do Correio Empresarial
                                <input type="password" autoComplete="current-password" required value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-slate-900 dark:text-white" />
                            </label>
                            <button type="submit" disabled={working} className="w-full rounded-xl bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-60">
                                {working ? "A verificar..." : "Entrar"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 flex flex-wrap gap-2">
                            {(["info", "alexandre"] as Account[]).map(item => (
                                <button key={item} type="button" onClick={() => { setAccount(item); setNotice(""); }}
                                    className={"rounded-xl border px-3 py-2 text-sm font-semibold " + (account === item
                                        ? "border-violet-700 bg-violet-700 text-white"
                                        : "border-slate-200 bg-white text-slate-700 dark:bg-slate-900 dark:text-white")}>
                                    {ADDRESSES[item]} {!status.accounts[item] ? "(não configurada)" : ""}
                                </button>
                            ))}
                        </div>
                        {!status.accounts[account] ? (
                            <div className="rounded-xl border bg-white p-5 text-sm text-slate-700 dark:bg-slate-900 dark:text-white">
                                Esta conta precisa do utilizador e da palavra-passe nas variáveis privadas da Vercel.
                            </div>
                        ) : (
                            <div className="grid gap-5 lg:grid-cols-2">
                                <section className="min-w-0 rounded-2xl border bg-white p-4 dark:bg-slate-900">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Inbox size={19} /> Caixa de entrada</h2>
                                        <button type="button" disabled={loadingMessages} onClick={() => void loadInbox(account)}
                                            aria-label="Actualizar caixa de entrada" className="rounded-lg border p-2 text-slate-600 dark:text-white"><RefreshCw size={16}/></button>
                                    </div>
                                    {loadingMessages ? <p className="text-sm text-slate-500">A carregar mensagens...</p> :
                                        messages.length === 0 ? <p className="text-sm text-slate-500">Sem mensagens ou ainda não carregadas.</p> : (
                                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                                {messages.map(item => (
                                                    <button type="button" key={item.uid} onClick={() => void read(item.uid)}
                                                        className="block w-full rounded-xl border border-slate-100 p-3 text-left hover:bg-violet-50 dark:border-white/10 dark:hover:bg-white/5">
                                                        <p className="truncate text-xs text-slate-500">{item.from} • {item.date}</p>
                                                        <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    {selected && (
                                        <article className="mt-4 border-t pt-4 text-sm text-slate-800 dark:text-white">
                                            <h3 className="font-bold">{selected.subject}</h3>
                                            <p className="mb-3 mt-1 break-words text-xs text-slate-500">{selected.from}</p>
                                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans">{selected.body}</pre>
                                            <button type="button" className="mt-3 text-sm font-semibold text-violet-600" onClick={() => {
                                                setTo(selected.from.includes("<") ? selected.from.split("<").pop()?.replace(">", "") || "" : selected.from);
                                                setSubject("Re: " + selected.subject);
                                            }}>Responder</button>
                                        </article>
                                    )}
                                </section>

                                <section className="min-w-0 rounded-2xl border bg-white p-4 dark:bg-slate-900">
                                    <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Send size={19} /> Nova mensagem</h2>
                                    <form className="space-y-3" onSubmit={send}>
                                        <p className="text-xs text-slate-500">De: {ADDRESSES[account]}</p>
                                        <label className="block text-sm font-medium">Para (máximo 5 endereços)
                                            <input required type="text" value={to} onChange={e => setTo(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-slate-900 dark:text-white"
                                                placeholder="destinatario@exemplo.com"/>
                                        </label>
                                        <label className="block text-sm font-medium">Assunto
                                            <input required maxLength={200} value={subject} onChange={e => setSubject(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-slate-900 dark:text-white"/>
                                        </label>
                                        <label className="block text-sm font-medium">Mensagem
                                            <textarea required rows={9} maxLength={15000} value={body} onChange={e => setBody(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-slate-900 dark:text-white"/>
                                        </label>
                                        <button type="submit" disabled={working} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-60">
                                            <Send size={16} /> {working ? "A processar..." : "Rever e confirmar envio"}
                                        </button>
                                        <p className="text-xs text-slate-500">O envio só ocorre após confirmação. Sem anexos nesta versão.</p>
                                    </form>
                                </section>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
