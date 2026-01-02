import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const sendWeeklyDigest = action({
    handler: async (ctx): Promise<{ success: boolean, count: number } | undefined> => {
        // Get recent published articles
        const articles = await ctx.runQuery(internal.articles.getPublishedInternal, {});
        const recentArticles = articles.slice(0, 3);

        if (recentArticles.length === 0) {
            console.log("No articles to send. Skipping digest.");
            return;
        }

        // Get all active subscribers
        const subscribers = await ctx.runQuery(internal.newsletter.getAllSubscribers);
        if (subscribers.length === 0) {
            console.log("No subscribers. Skipping digest.");
            return;
        }

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
            throw new Error("RESEND_API_KEY not found in Convex environment variables");
        }

        // Prepare the email HTML
        const articlesHtml = recentArticles.map(art => `
            <div style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${art.title}</h3>
                <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">${art.excerpt}</p>
                <a href="https://vitaleevo.ao/blog/${art.slug}" style="color: #8b5cf6; font-weight: bold; text-decoration: none; font-size: 14px;">Ler Artigo Completo →</a>
            </div>
        `).join('');

        // Send to all subscribers
        for (const sub of subscribers) {
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8b5cf6; margin: 0;">VitalEvo Weekly Digest</h1>
                        <p style="color: #64748b;">As novidades que você não pode perder.</p>
                    </div>
                    
                    ${articlesHtml}

                    <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #1e293b;">Quer ver mais novidades?</p>
                        <a href="https://vitaleevo.ao/blog" style="background-color: #8b5cf6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">Visitar o Blog</a>
                    </div>

                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                    <p style="font-size: 10px; color: #94a3b8; text-align: center;">
                        Você recebeu este e-mail porque se inscreveu na newsletter da VitalEvo.<br/>
                        Se desejar sair, <a href="https://vitaleevo.ao/unsubscribe?email=${sub.email}" style="color: #94a3b8;">clique aqui</a>.
                    </p>
                </div>
            `;

            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'VitalEvo <onboarding@resend.dev>',
                        to: [sub.email],
                        subject: 'O melhor da semana na VitalEvo 🚀',
                        html: emailHtml,
                    }),
                });
            } catch (err) {
                console.error(`Failed to send digest to ${sub.email}:`, err);
            }
        }

        return { success: true, count: subscribers.length };
    },
});
