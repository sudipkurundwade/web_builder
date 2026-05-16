import { ApiError } from "../utils/ApiError.js";

const WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60 * 1000);
const MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS || 14);
const userRateMap = new Map();

const aiRateLimit = (req, _res, next) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
        return next(new ApiError(401, "Unauthorized request"));
    }

    const now = Date.now();
    const current = userRateMap.get(userId);

    if (!current || now >= current.resetAt) {
        userRateMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    if (current.count >= MAX_REQUESTS) {
        const secondsLeft = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
        return next(
            new ApiError(429, `AI rate limit reached. Please wait ${secondsLeft} seconds before trying again.`),
        );
    }

    current.count += 1;
    userRateMap.set(userId, current);
    return next();
};

export { aiRateLimit };
