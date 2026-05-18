// src/services/aiService.ts
// Calls the backend /api/ai/chat endpoint which proxies to Gemini.

import api from "@/lib/api";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface SiteAuditFinding {
    id: string;
    category: "accessibility" | "mobile" | "links" | "images" | "copy" | "seo" | string;
    severity: "high" | "medium" | "low";
    title: string;
    description: string;
    fixPrompt: string;
}

export interface SiteAuditResult {
    score: number;
    summary: string;
    findings: SiteAuditFinding[];
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

export async function auditSitePage(input: {
    html: string;
    css: string;
    pageName: string;
    seo: {
        title?: string;
        description?: string;
        slug?: string;
        faviconUrl?: string;
        ogImageUrl?: string;
    };
}): Promise<SiteAuditResult> {
    const response = await api.post<{ data: SiteAuditResult }>("/ai/audit", input);
    return response.data.data;
}
