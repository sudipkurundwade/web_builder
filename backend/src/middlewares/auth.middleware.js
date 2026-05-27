import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * JWT Auth Middleware
 * Verifies the Authorization: Bearer <token> header
 * Attaches `req.user` for downstream controllers
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    // Support both Authorization header and cookies
    const token =
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.cookies?.token;

    if (!token) {
        throw new ApiError(401, "Unauthorized - no token provided");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
        throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
});

export const optionalJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.cookies?.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");
    } catch {
        req.user = null;
    }

    return next();
});

export const requireAdmin = asyncHandler(async (req, _, next) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "Forbidden - admin access required");
    }

    next();
});
