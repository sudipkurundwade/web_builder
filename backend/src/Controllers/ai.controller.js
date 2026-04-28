import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UIComponent, PageBlock } from "../models/block.model.js";

const buildCatalogue = (blocks) =>
  blocks
    .map((b) => `[${b.label}] tags: ${(b.tags || []).join(",")} | html: ${b.html}`)
    .join("\n\n");

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

    if (!process.env.gemini_API_KEY) {
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
        const genAI = new GoogleGenerativeAI(process.env.gemini_API_KEY);
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
        
        let friendlyReply = "I encountered an unknown error connecting to the AI servers. Please try again later.";
        
        if (error.status === 429) {
            friendlyReply = "⚠️ **Rate Limit Reached**\nYou are using the free tier of the Gemini API, which allows a maximum of 15 requests per minute. Please wait 10-15 seconds and try sending your request again!";
        } else if (
            error.status === 401
            || error.status === 403
            || /api key/i.test(error.message || "")
            || /invalid/i.test(error.message || "")
        ) {
            friendlyReply = "⚠️ **Invalid API Key**\nIt looks like your `gemini_API_KEY` is invalid or missing. Please check your backend `.env` file, ensure the key is correct, and restart the backend server.";
        } else if (error.message) {
            friendlyReply = `⚠️ **AI Service Error:** ${error.message}`;
        }

        // Return a graceful 200 response with the error as an AI reply
        // This prevents Axios from throwing 500 errors in the browser console
        return res.status(200).json(
            new ApiResponse(200, { reply: friendlyReply }, "Handled AI error gracefully")
        );
    }
});

export { chatWithAI };
