"use server";

import { Resend } from "resend";
import { API_BASE_URL } from "@/shared/utils/apiClient";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM;
const contactRecipient = process.env.CONTACT_EMAIL ?? "info@vitaleevo.ao";
const newsletterRecipient = process.env.NEWSLETTER_EMAIL ?? "negociosvitaleevo@gmail.com";
const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitaleevo.ao";

interface ContactFormData {
    name: string;
    phone: string;
    subject: string;
    message: string;
    email?: string;
}

interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    total: number;
    items: Array<{ name: string; price: number; quantity: number }>;
    shippingAddress: { city?: string; address?: string; reference?: string };
    paymentMethod: string;
}

function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sanitizeHeader(value: unknown): string {
    return String(value ?? "").replace(/[\r\n]+/g, " ").trim();
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getEmailServiceError() {
    if (!resend || !emailFrom) {
        return { success: false, error: "Serviço de e-mail não configurado." };
    }
    return null;
}

function formatKwanza(value: number): string {
    return Number.isFinite(value) ? value.toLocaleString("pt-AO") : "0";
}

export async function sendContactEmail(data: ContactFormData) {
    const serviceError = getEmailServiceError();
    if (serviceError) return serviceError;

    const name = sanitizeHeader(data.name);
    const phone = sanitizeHeader(data.phone);
    const subject = sanitizeHeader(data.subject);
    const message = String(data.message ?? "").trim().slice(0, 5_000);
    const email = sanitizeHeader(data.email).toLowerCase();

    if (!name || !phone || !subject || !message || (email && !isValidEmail(email))) {
        return { success: false, error: "Dados de contacto inválidos." };
    }

    try {
        const { data: resendData, error } = await resend!.emails.send({
            from: emailFrom!,
            to: [contactRecipient],
            subject: `Novo contacto: ${subject}`,
            replyTo: email || undefined,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:20px">
                    <h2 style="color:#3b82f6">Novo contacto recebido</h2>
                    <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
                    <p><strong>WhatsApp/Telefone:</strong> ${escapeHtml(phone)}</p>
                    ${email ? `<p><strong>E-mail:</strong> ${escapeHtml(email)}</p>` : ""}
                    <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
                    <div style="background:#f9fafb;padding:15px;border-radius:8px;margin-top:20px">
                        <p><strong>Mensagem:</strong></p>
                        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
                    </div>
                </div>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data: resendData };
    } catch {
        return { success: false, error: "Não foi possível enviar o contacto." };
    }
}

export async function sendOrderEmail(data: OrderEmailData) {
    const serviceError = getEmailServiceError();
    if (serviceError) return serviceError;

    const customerEmail = sanitizeHeader(data.customerEmail).toLowerCase();
    if (!isValidEmail(customerEmail) || !data.orderNumber || !Array.isArray(data.items)) {
        return { success: false, error: "Dados do pedido inválidos." };
    }

    const itemsHtml = data.items.slice(0, 100).map((item) => `
        <tr>
            <td style="padding:10px;border-bottom:1px solid #eee">${escapeHtml(item.name)} × ${Number(item.quantity) || 0}</td>
            <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">Kz ${formatKwanza(Number(item.price))}</td>
        </tr>
    `).join("");

    try {
        const { data: resendData, error } = await resend!.emails.send({
            from: emailFrom!,
            to: [contactRecipient],
            subject: `Novo pedido: #${sanitizeHeader(data.orderNumber)}`,
            replyTo: customerEmail,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:20px">
                    <h2 style="color:#16a34a">Novo pedido recebido</h2>
                    <p><strong>Número:</strong> #${escapeHtml(data.orderNumber)}</p>
                    <p><strong>Cliente:</strong> ${escapeHtml(data.customerName)}</p>
                    <p><strong>E-mail:</strong> ${escapeHtml(customerEmail)}</p>
                    <p><strong>Telefone:</strong> ${escapeHtml(data.customerPhone)}</p>
                    <h3 style="margin-top:30px">Itens do pedido</h3>
                    <table style="width:100%;border-collapse:collapse">
                        <thead><tr><th style="text-align:left">Produto</th><th style="text-align:right">Preço</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot><tr><td style="padding:10px;font-weight:bold">Total</td><td style="padding:10px;font-weight:bold;text-align:right">Kz ${formatKwanza(Number(data.total))}</td></tr></tfoot>
                    </table>
                    <h3 style="margin-top:30px">Entrega</h3>
                    <p>${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.address)}<br>Ref: ${escapeHtml(data.shippingAddress.reference || "N/A")}</p>
                    <p><strong>Pagamento:</strong> ${escapeHtml(data.paymentMethod)}</p>
                </div>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data: resendData };
    } catch {
        return { success: false, error: "Não foi possível enviar o pedido." };
    }
}

export async function subscribeToNewsletter(email: string) {
    const serviceError = getEmailServiceError();
    if (serviceError) return serviceError;

    const normalizedEmail = sanitizeHeader(email).toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
        return { success: false, error: "E-mail inválido." };
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/cms/newsletters/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => null);
            const first = data?.email?.[0] ?? data?.detail;
            if (typeof first === "string" && /já|existente|duplicado/i.test(first)) {
                return { success: false, error: "Este e-mail já está inscrito." };
            }
            return { success: false, error: "Não foi possível concluir a inscrição." };
        }

        const welcome = await resend!.emails.send({
            from: emailFrom!,
            to: [normalizedEmail],
            subject: "Bem-vindo à VitalEvo",
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:20px">
                    <h1 style="color:#8b5cf6">Bem-vindo à nossa comunidade</h1>
                    <p>Olá,</p>
                    <p>Obrigado por se inscrever na newsletter da VitalEvo.</p>
                    <p><a href="${escapeHtml(siteUrl)}/contact" style="color:#8b5cf6;font-weight:bold">Fale com um consultor</a></p>
                </div>
            `,
        });
        if (welcome.error) return { success: false, error: welcome.error.message };

        const { data, error } = await resend!.emails.send({
            from: emailFrom!,
            to: [newsletterRecipient],
            subject: "Nova inscrição na newsletter",
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;padding:20px">
                    <h2 style="color:#8b5cf6">Nova inscrição</h2>
                    <p><strong>E-mail:</strong> ${escapeHtml(normalizedEmail)}</p>
                    <p><strong>Data:</strong> ${escapeHtml(new Date().toLocaleString("pt-AO"))}</p>
                </div>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch {
        return { success: false, error: "Não foi possível concluir a inscrição." };
    }
}
