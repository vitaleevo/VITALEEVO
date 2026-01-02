"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const chat = action({
    args: {
        message: v.string(),
        history: v.optional(v.array(v.object({
            role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
            content: v.string()
        })))
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error("A chave da API da OpenAI não está configurada (OPENAI_API_KEY).");
        }

        // Default system message if none provided or to enforce persona
        const systemMessage = {
            role: "system",
            content: "Você é o assistente virtual da VitalEvo, uma empresa de tecnologia e consultoria em Angola. Você é profissional, útil e fala português. O seu objetivo é ajudar os clientes a entenderem nossos serviços (Desenvolvimento Web, Apps, Marketing, Consultoria) e a agendarem reuniões."
        };

        const messages = [
            systemMessage,
            ...(args.history || []),
            { role: "user", content: args.message }
        ];

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo", // You can change to gpt-4 if available
                    messages: messages,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error: any) {
            console.error("OpenAI call failed:", error);
            throw new Error("Falha ao comunicar com a inteligência artificial. Tente novamente mais tarde.");
        }
    },
});
