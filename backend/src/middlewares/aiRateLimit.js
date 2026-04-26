import { ApiError } from "../utils/ApiError.js";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;
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
        const minutesLeft = Math.max(1, Math.ceil((current.resetAt - now) / (60 * 1000)));
        return next(
            new ApiError(429, `AI rate limit reached. Resets in ${minutesLeft} minutes.`),
        );
    }

    current.count += 1;
    userRateMap.set(userId, current);
    return next();
};

export { aiRateLimit };
