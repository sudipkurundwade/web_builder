import { Router } from "express";
import { signup, login, getMe, updateAppearanceSettings } from "../Controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/auth/signup   — register new user
router.post("/signup", signup);

// POST /api/auth/login    — login and get JWT
router.post("/login", login);

// GET  /api/auth/me       — get current user (protected)
router.get("/me", verifyJWT, getMe);

router.put("/appearance", verifyJWT, updateAppearanceSettings);

export default router;
