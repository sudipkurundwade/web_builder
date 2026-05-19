import { Router } from "express";
import { getAnalyticsSummary, trackAnalyticsEvent } from "../Controllers/analytics.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/events", verifyJWT, trackAnalyticsEvent);
router.get("/summary", verifyJWT, requireAdmin, getAnalyticsSummary);

export default router;
