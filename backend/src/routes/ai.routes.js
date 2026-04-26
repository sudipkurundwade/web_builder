import { Router } from "express";
import { chatWithAI } from "../Controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { aiRateLimit } from "../middlewares/aiRateLimit.js";

const router = Router();

// Require auth so only logged-in users can use AI
router.use(verifyJWT);

// POST /api/ai/chat  — body: { messages: [{role, content}] }
router.post("/chat", aiRateLimit, chatWithAI);

export default router;
