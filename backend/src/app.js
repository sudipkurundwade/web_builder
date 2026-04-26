import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// Routes
import authRouter from './routes/auth.routes.js'
import projectRouter from './routes/project.routes.js'
import uploadRouter from './routes/upload.routes.js'
import aiRouter from './routes/ai.routes.js'
import blocksRouter from "./routes/blocks.routes.js";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(express.static("public"))
app.use(cookieParser())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter)          // POST /api/auth/signup, /login, GET /api/auth/me
app.use("/api/projects", projectRouter)   // CRUD for GrapesJS projects
app.use("/api/upload", uploadRouter)      // Image Uploads
app.use("/api/ai", aiRouter)              // Gemini AI Chat
app.use("/api/blocks", blocksRouter)      // Component/page block library

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health-check", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is running" })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    })
})

export { app }
