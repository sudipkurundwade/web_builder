// src/services/aiService.ts
// Calls the backend /api/ai/chat endpoint which proxies to Gemini.

import api from "@/lib/api";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/**
 * Sends the full conversation history to Gemini via the backend proxy.
 * If selectedHtml is provided, the backend prepends it to the last message so
 * Gemini knows exactly which element to modify instead of generating a new one.
 * Returns the AI's reply string.
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    selectedHtml?: string
): Promise<string> {
    const response = await api.post<{ data: { reply: string } }>("/ai/chat", { messages, selectedHtml });
    return response.data.data.reply;
}
