import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const sendQuoteConfirmation = action({
    args: { quoteId: v.id("quoteRequests") },
    handler: async (ctx, args): Promise<{ success: boolean; status?: number; reason?: string }> => {
        const data: {
            quote: { name: string; email: string; publicId: string; message?: string };
            items: { name: string; quantity: number; sku?: string }[];
        } | null = await ctx.runQuery(internal.quotes.getQuoteInternal, { quoteId: args.quoteId });
        if (!data) return { success: false, reason: "not_found" };

        const { quote, items } = data;
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
            console.log("RESEND_API_KEY não configurada; confirmação por e-mail ignorada");
            return { success: false, reason: "no_api_key" };
        }

        const itemsHtml = items
            .map(
                (i) => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${i.sku ?? "—"}</td>
                </tr>`
            )
            .join("");

        const waNumber = "244950744445";
        const waMessage = encodeURIComponent(
            `Olá! Sou ${quote.name}. Acabei de enviar um pedido de cotação (referência ${quote.publicId}).`
        );

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h1 style="color: #7c3aed; margin: 0;">VitalEvo</h1>
                    <p style="color: #64748b;">Recebemos o seu pedido de cotação</p>
                </div>
                <p>Olá <strong>${quote.name}</strong>,</p>
                <p>Recebemos o seu pedido de cotação com a referência <strong>${quote.publicId}</strong>. A nossa equipa comercial vai contactá-lo em breve.</p>
                <h3 style="color: #1e293b;">Itens solicitados</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="padding: 10px; text-align: left;">Produto</th>
                            <th style="padding: 10px;">Qtd</th>
                            <th style="padding: 10px;">Ref.</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                    ${quote.message ? `A sua mensagem: <em>${quote.message}</em><br/><br/>` : ""}
                    Pode acompanhar o estado do pedido usando a referência acima.
                </p>
                <div style="margin-top: 25px; text-align: center;">
                    <a href="https://wa.me/${waNumber}?text=${waMessage}"
                       style="background-color: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Falar connosco no WhatsApp
                    </a>
                </div>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 10px; color: #94a3b8; text-align: center;">
                    VitalEvo — Comércio e Serviços, Lda · Benfica, Luanda · +244 950 744 445
                </p>
            </div>
        `;

        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "VitalEvo <onboarding@resend.dev>",
                    to: [quote.email],
                    subject: `Pedido de cotação ${quote.publicId} — VitalEvo`,
                    html: emailHtml,
                }),
            });
            return { success: response.ok, status: response.status };
        } catch (err) {
            console.error("Falha ao enviar confirmação de cotação:", err);
            return { success: false, reason: "send_error" };
        }
    },
});