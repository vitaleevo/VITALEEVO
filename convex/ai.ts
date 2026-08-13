import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const chat = action({
    args: {
        message: v.string(),
        history: v.optional(v.array(v.object({
            role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
            content: v.string()
        })))
    },
    handler: async (ctx, args) => {
        const activeKeys: any = await ctx.runQuery(internal.apiKeys.getAllActiveInternal);

        if (!activeKeys || activeKeys.length === 0) {
            throw new Error("Nenhuma API de IA está configurada ou ativa. Por favor, configure e ative uma chave de API no painel de administração.");
        }

        const systemInstruction = `Você é o assistente virtual da VitalEvo, uma empresa de tecnologia e consultoria em Angola... (resto da instrução)`; // Simplified for context

        // Get actual system instruction from logic
        const fullSystemInstruction = `Você é o assistente virtual da VitalEvo, uma empresa de tecnologia e consultoria em Angola. Você é profissional, útil e fala português. 

RESPONDA APENAS a questões relacionadas aos serviços da VitalEvo:
- Desenvolvimento Web e E-commerce (Criação de sites, lojas online, plataformas)
- Desenvolvimento de Aplicações Móveis (Android e iOS)
- Marketing Digital e Gestão de Redes Sociais
- Consultoria Tecnológica e Estratégica
- Design Gráfico e Branding
- Contactos e Localização (Sede em Luanda, Angola)

REGRAS CRÍTICAS:
1. Se o utilizador perguntar algo fora do âmbito dos serviços da VitalEvo ou tecnologia empresarial, responda educadamente: "Desculpe, sou um assistente especializado na VitalEvo e só posso ajudar com questões relacionadas aos nossos serviços e à nossa empresa. Como posso ajudar o seu negócio a crescer hoje?"
2. Não responda a perguntas sobre cultura geral, desporto, política ou outros temas irrelevantes.
3. Convide sempre o utilizador a marcar uma reunião se ele demonstrar interesse num serviço.
4. Mantenha as respostas curtas, profissionais e focadas em converter o utilizador num cliente.`;

        let lastError = "";

        // Try each active key until one works
        for (const { provider, apiKey } of activeKeys) {
            try {
                console.log(`Tentando provedor: ${provider}...`);
                if (provider === "gemini") return await callGemini(apiKey, fullSystemInstruction, args.message, args.history || []);
                if (provider === "openai") return await callOpenAI(apiKey, fullSystemInstruction, args.message, args.history || []);
                if (provider === "anthropic") return await callAnthropic(apiKey, fullSystemInstruction, args.message, args.history || []);
                if (provider === "huggingface") return await callHuggingFace(apiKey, fullSystemInstruction, args.message, args.history || []);
            } catch (error: any) {
                console.error(`Falha no provedor ${provider}:`, error.message);
                lastError = error.message;
                // Continue to next provider...
            }
        }

        throw new Error(`Todas as APIs falharam. Último erro: ${lastError}`);
    },
});

async function callGemini(apiKey: string, systemInstruction: string, message: string, history: any[]) {
    // Model selection: gemini-1.5-flash is faster and more robust
    const model = "gemini-1.5-flash";

    // Process history to ensure alternating roles (user -> model -> user -> model)
    // Gemini is very strict about this order.
    let contents: any[] = [];

    // Filter and map roles
    const filteredHistory = history.filter(msg => msg.role !== 'system');

    for (const msg of filteredHistory) {
        const role = msg.role === 'assistant' ? 'model' : 'user';

        // Ensure alternating: don't add if role is the same as previous
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += "\n" + msg.content;
        } else {
            contents.push({
                role: role,
                parts: [{ text: msg.content }]
            });
        }
    }

    // Ensure it starts with 'user' (Gemini requirement)
    if (contents.length > 0 && contents[0].role === 'model') {
        contents.shift();
    }

    // Add current message
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += "\n" + message;
    } else {
        contents.push({
            role: "user",
            parts: [{ text: message }]
        });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        throw new Error(`Gemini Error: ${errorMessage}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) throw new Error("Resposta vazia do Gemini.");
    return responseText;
}

async function callOpenAI(apiKey: string, systemInstruction: string, message: string, history: any[]) {
    const messages = [{ role: "system", content: systemInstruction }, ...history, { role: "user", content: message }];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-3.5-turbo", messages, temperature: 0.7 }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI Error: ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content;
}

async function callAnthropic(apiKey: string, systemInstruction: string, message: string, history: any[]) {
    const messages = history.filter(msg => msg.role !== 'system').map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content }));
    messages.push({ role: "user", content: message });
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1024, system: systemInstruction, messages }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic Error: ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return data.content[0].text;
}

async function callHuggingFace(apiKey: string, systemInstruction: string, message: string, history: any[]) {
    // We'll use Mistral-7B-Instruct-v0.3 as a default reliable model on HF
    const model = "mistralai/Mistral-7B-Instruct-v0.3";

    // Hugging Face now supports OpenAI-compatible Chat Completions API
    const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(msg => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content
        })),
        { role: "user", content: message }
    ];

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error || response.statusText;
        throw new Error(`Hugging Face Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Erro: Resposta vazia do Hugging Face";
}
