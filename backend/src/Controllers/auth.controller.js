import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generates a JWT token containing userId
 */
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * POST /api/auth/signup
 * Register a new user with name, email, password
 */
const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "user";

    // Create user (password hashed via pre-save hook)
    await User.create({ name, email, password, role });

    return res.status(201).json(
        new ApiResponse(201, { message: "Account created successfully" }, "User registered successfully")
    );
});

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT token
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "No account found with this email");
    }

    // Compare passwords
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    // Generate JWT token with userId
    const token = generateToken(user._id);

    // Return token and user info (exclude password)
    return res.status(200).json(
        new ApiResponse(200, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                role: user.role,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                location: user.location,
                socialLinks: user.socialLinks,
            },
        }, "Login successful")
    );
});

/**
 * GET /api/auth/me
 * Get current user from JWT token
 */
const getMe = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(
        new ApiResponse(200, {
            id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            role: user.role,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            location: user.location,
            socialLinks: user.socialLinks,
        }, "User fetched successfully")
    );
});

export { signup, login, getMe };
