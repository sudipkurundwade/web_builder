// src/services/aiService.ts
// Calls the backend /api/ai/chat endpoint which proxies to Gemini.

import api from "@/lib/api";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/**
 * Sends the full conversation history to Gemini via the backend proxy.
 * Returns the AI's reply string.
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
    const response = await api.post<{ data: { reply: string } }>("/ai/chat", { messages });
    return response.data.data.reply;
}
