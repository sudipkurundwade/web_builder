import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UIComponent, PageBlock } from "../models/block.model.js";

const buildCatalogue = (blocks) =>
  blocks
    .map((b) => `[${b.label}] tags: ${(b.tags || []).join(",")} | html: ${b.html}`)
    .join("\n\n");

const getGeminiRetrySeconds = (error) => {
    const retryDelay = error?.errorDetails?.find?.((detail) => detail?.["@type"]?.includes("RetryInfo"))?.retryDelay;
    if (typeof retryDelay === "string") {
        const match = retryDelay.match(/^(\d+)s$/);
        if (match) return Number(match[1]);
    }

    const messageMatch = String(error?.message || "").match(/retryDelay["']?\s*:\s*["']?(\d+)s/i);
    return messageMatch ? Number(messageMatch[1]) : 15;
};

const hasZeroGeminiQuota = (error) =>
    String(error?.message || "").includes("limit: 0")
    || error?.errorDetails?.some?.((detail) =>
        detail?.violations?.some?.((violation) =>
            String(violation?.quotaId || "").includes("FreeTier"),
        ),
    );

const extractJsonObject = (text = "") => {
    const stripped = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("AI audit response did not contain JSON");
    }
    return JSON.parse(stripped.slice(start, end + 1));
};

const normalizeAudit = (raw) => {
    const findings = Array.isArray(raw?.findings) ? raw.findings : [];
    return {
        score: Number.isFinite(Number(raw?.score)) ? Math.max(0, Math.min(100, Number(raw.score))) : 0,
        summary: String(raw?.summary || "Audit complete. Review the suggestions below."),
        findings: findings.slice(0, 8).map((finding, index) => ({
            id: String(finding?.id || `finding-${index + 1}`),
            category: String(finding?.category || "quality"),
            severity: ["high", "medium", "low"].includes(finding?.severity) ? finding.severity : "medium",
            title: String(finding?.title || "Suggested improvement").slice(0, 100),
            description: String(finding?.description || "").slice(0, 360),
            fixPrompt: String(finding?.fixPrompt || "Improve this page based on the audit finding.").slice(0, 500),
        })),
    };
};

const SYSTEM_PROMPT = (uiBlocks, pageBlocks) => `You are an expert UI builder inside a GrapesJS drag-and-drop website builder with Tailwind CSS.

You have access to a pre-built component library stored in our database. ALWAYS use these components as your starting point - never build from scratch.

STRICT OUTPUT RULES:
1. Use Tailwind CSS utility classes as your primary styling method. You may also use <style> tags for custom CSS, keyframes, or complex selectors when Tailwind isn't sufficient.
2. NEVER write <script> tags or JavaScript.
3. NEVER wrap in <html>, <head>, or <body> tags.
4. Always output a single root element (e.g., <div>, <nav>, <section>).
5. Wrap HTML output in triple backtick html fences.
6. After the code block, write 1-2 sentences describing what was built.
7. When asked to EDIT a component, return the COMPLETE updated HTML including any <style> tags.
8. When asked to COMBINE components, merge them into one root element.
9. When asked to update NAVIGATIONS, ensure you build properly structured, responsive navigation menus using semantic <nav> and <a> tags.

WORKFLOW - follow this exactly:
Step 1: Read the user's request carefully.
Step 2: Find the best matching block(s) from the catalogue below.
Step 3: Use that block's HTML as your base.
Step 4: Customize it to match the user's exact request (colors, text, CSS, layout tweaks, and navigation links).
Step 5: Return the final HTML.

If no block matches, THEN you may build from scratch using Tailwind classes and <style> tags.

━━━ UI COMPONENTS CATALOGUE ━━━
${buildCatalogue(uiBlocks)}

━━━ PAGE BLOCKS CATALOGUE ━━━
${buildCatalogue(pageBlocks)}
`;

const chatWithAI = asyncHandler(async (req, res) => {
    const { messages, selectedHtml } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new ApiError(400, "Messages array is required");
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.gemini_API_KEY;
    if (!geminiApiKey) {
        throw new ApiError(500, "Gemini API key is not configured on the server");
    }

    const MAX_HISTORY = 20;
    const trimmedMessages = messages.length > MAX_HISTORY
        ? messages.slice(messages.length - MAX_HISTORY)
        : messages;

    let history = trimmedMessages.slice(0, -1).map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));

    // Gemini strictly requires the first message in history to be from the user.
    // If the frontend included the initial assistant greeting, we remove it here.
    if (history.length > 0 && history[0].role === "model") {
        history.shift();
    }

    const lastMessage = trimmedMessages[trimmedMessages.length - 1];
    if (lastMessage.role !== "user") {
        throw new ApiError(400, "Last message must be from user");
    }

    const messageToSend = selectedHtml
        ? `The user has selected this component on the canvas:\n\`\`\`html\n${selectedHtml}\n\`\`\`\n\nUser instruction: ${lastMessage.content}\n\nReturn the COMPLETE updated HTML for this component based on the instruction. Do not return a new component — modify the existing one.`
        : lastMessage.content;

    try {
        const uiBlocks = await UIComponent.find({ isActive: true }).select("label category tags html");
        const pageBlocks = await PageBlock.find({ isActive: true }).select("label category tags html");
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT(uiBlocks, pageBlocks),
        });

        const chat = model.startChat({ history });

        const result = await chat.sendMessage(messageToSend);
        const response = result.response;
        const text = response.text();

        return res.status(200).json(
            new ApiResponse(200, { reply: text }, "AI response generated successfully")
        );
    } catch (error) {
        // Log locally for debugging
        console.error("Gemini API Error details:", error);
        
        if (error.status === 429) {
            const retrySeconds = getGeminiRetrySeconds(error);
            if (hasZeroGeminiQuota(error)) {
                throw new ApiError(
                    429,
                    `Gemini quota is 0 for model ${process.env.GEMINI_MODEL || "gemini-2.0-flash"}. Check this API key's Google AI Studio project quota, switch to a project with free quota, enable billing, or choose a model with available quota. Retry suggested by Google: ${retrySeconds} seconds.`,
                );
            }

            throw new ApiError(
                429,
                `Gemini rate limit reached. Please wait ${retrySeconds} seconds before sending another AI request.`,
            );
        }

        if (
            error.status === 401
            || error.status === 403
            || /api key/i.test(error.message || "")
            || /invalid/i.test(error.message || "")
        ) {
            throw new ApiError(
                502,
                "Gemini API key is invalid or missing. Check backend .env, update GEMINI_API_KEY, and restart the backend server.",
            );
        }

        throw new ApiError(
            502,
            error.message ? `AI service error: ${error.message}` : "AI service is unavailable. Please try again later.",
        );
    }
});

const auditSite = asyncHandler(async (req, res) => {
    const {
        html = "",
        css = "",
        pageName = "Current page",
        seo = {},
    } = req.body;

    if (!String(html).trim()) {
        throw new ApiError(400, "Page HTML is required for audit");
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.gemini_API_KEY;
    if (!geminiApiKey) {
        throw new ApiError(500, "Gemini API key is not configured on the server");
    }

    const prompt = `Audit this website-builder page for launch quality.

Check these areas:
- Accessibility: semantic structure, headings, alt text, contrast risks, button/link labels.
- Mobile spacing: cramped grids, fixed widths, overflow risk, touch targets.
- Broken links: empty hrefs, placeholder links, unsafe javascript links, missing form actions.
- Missing image alt text.
- Weak copy: vague CTAs, placeholder text, unclear value proposition.
- SEO and social preview: title, description, slug, favicon, OG image.

Return ONLY valid JSON in this exact shape:
{
  "score": 0-100,
  "summary": "one sentence",
  "findings": [
    {
      "id": "short-kebab-id",
      "category": "accessibility|mobile|links|images|copy|seo",
      "severity": "high|medium|low",
      "title": "short title",
      "description": "specific issue and why it matters",
      "fixPrompt": "instruction for an AI editor to fix this issue in the provided page HTML"
    }
  ]
}

Keep findings concrete and actionable. Prefer fixes that can be made by changing HTML/Tailwind classes. Do not invent external facts.

Page name: ${pageName}
SEO metadata: ${JSON.stringify(seo)}
CSS:
\`\`\`css
${String(css).slice(0, 12000)}
\`\`\`
HTML:
\`\`\`html
${String(html).slice(0, 45000)}
\`\`\``;

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        });

        const result = await model.generateContent(prompt);
        const audit = normalizeAudit(extractJsonObject(result.response.text()));

        return res.status(200).json(
            new ApiResponse(200, audit, "AI site audit generated successfully")
        );
    } catch (error) {
        console.error("Gemini Audit Error details:", error);

        if (error.status === 429) {
            const retrySeconds = getGeminiRetrySeconds(error);
            throw new ApiError(429, `Gemini rate limit reached. Please wait ${retrySeconds} seconds before sending another AI request.`);
        }

        if (
            error.status === 401
            || error.status === 403
            || /api key/i.test(error.message || "")
            || /invalid/i.test(error.message || "")
        ) {
            throw new ApiError(502, "Gemini API key is invalid or missing. Check backend .env, update GEMINI_API_KEY, and restart the backend server.");
        }

        throw new ApiError(
            502,
            error.message ? `AI audit error: ${error.message}` : "AI audit is unavailable. Please try again later.",
        );
    }
});

export { chatWithAI, auditSite };
