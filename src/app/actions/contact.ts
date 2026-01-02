"use server";

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ContactFormData {
    name: string;
    phone: string;
    subject: string;
    message: string;
    email?: string;
}

export async function sendContactEmail(data: ContactFormData) {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "E-mail service not configured" };
    }

    try {
        const { name, phone, subject, message, email } = data;

        if (!resend) throw new Error("RESEND_API_KEY not configured");

        const { data: resendData, error } = await resend.emails.send({
            from: 'VitalEvo <onboarding@resend.dev>', // Usando remetente de teste até o domínio ser verificado
            to: ['info@vitaleevo.ao'],
            subject: `Novo Contacto: ${subject}`,
            replyTo: email || undefined,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #3b82f6;">Novo Contacto Recebido</h2>
                    <p><strong>Nome:</strong> ${name}</p>
                    <p><strong>WhatsApp/Telefone:</strong> ${phone}</p>
                    ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                    <p><strong>Assunto:</strong> ${subject}</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p><strong>Mensagem:</strong></p>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #666;">
                        Este email foi enviado automaticamente pelo formulário de contacto do site VitalEvo via Resend.
                    </p>
                </div>
            `,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: resendData };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendOrderEmail(data: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    total: number;
    items: any[];
    shippingAddress: any;
    paymentMethod: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "E-mail service not configured" };
    }

    try {
        const { orderNumber, customerName, customerEmail, customerPhone, total, items, shippingAddress, paymentMethod } = data;

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Kz ${item.price.toLocaleString()}</td>
            </tr>
        `).join('');

        if (!resend) throw new Error("RESEND_API_KEY not configured");

        const { data: resendData, error } = await resend.emails.send({
            from: 'VitalEvo <onboarding@resend.dev>',
            to: ['info@vitaleevo.ao'],
            subject: `Novo Pedido: #${orderNumber} - ${customerName}`,
            replyTo: customerEmail,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #16a34a;">Novo Pedido Recebido!</h2>
                    <p><strong>Número do Pedido:</strong> #${orderNumber}</p>
                    <p><strong>Cliente:</strong> ${customerName}</p>
                    <p><strong>Email:</strong> ${customerEmail}</p>
                    <p><strong>Telefone:</strong> ${customerPhone}</p>
                    
                    <h3 style="margin-top: 30px;">Itens do Pedido</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9fafb;">
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Produto</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">Preço</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Total</td>
                                <td style="padding: 10px; font-weight: bold; text-align: right;">Kz ${total.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <h3 style="margin-top: 30px;">Endereço de Entrega</h3>
                    <p>${shippingAddress.city}, ${shippingAddress.address}<br />Ref: ${shippingAddress.reference || 'N/A'}</p>

                    <p><strong>Método de Pagamento:</strong> ${paymentMethod}</p>

                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #666;">
                        Este email foi enviado automaticamente pelo sistema da VitalEvo via Resend.
                    </p>
                </div>
            `,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: resendData };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "E-mail service not configured" };
    }

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/recuperar-senha?token=${token}`;

    try {
        if (!resend) throw new Error("RESEND_API_KEY not configured");

        const { data, error } = await resend.emails.send({
            from: 'VitalEvo <onboarding@resend.dev>',
            to: [email],
            subject: 'Recuperação de Senha - VitalEvo',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #3b82f6;">Recuperação de Senha</h2>
                    <p>Olá, ${name}!</p>
                    <p>Recebemos uma solicitação para redefinir a sua senha. Clique no botão abaixo para prosseguir:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
                    </div>
                    <p>Se você não solicitou isso, por favor ignore este e-mail. O link é válido por 1 hora.</p>
                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #666;">
                        Este email foi enviado automaticamente pelo sistema da VitalEvo.
                    </p>
                </div>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function subscribeToNewsletter(email: string) {
    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "E-mail service not configured" };
    }

    try {
        if (!resend) throw new Error("RESEND_API_KEY not configured");

        // Send email to admin notifying about new subscriber
        const { data, error } = await resend.emails.send({
            from: 'VitalEvo <onboarding@resend.dev>',
            to: ['negociosvitaleevo@gmail.com'],
            subject: 'Nova Inscrição na Newsletter',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #8b5cf6;">Nova Inscrição na Newsletter! 🎉</h2>
                    <p>Um novo usuário se inscreveu para receber novidades.</p>
                    <p><strong>Email do Inscrito:</strong> ${email}</p>
                    <p><strong>Data:</strong> ${new Date().toLocaleString('pt-AO')}</p>
                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #666;">
                        Este email foi enviado automaticamente pelo sistema da VitalEvo.
                    </p>
                </div>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
