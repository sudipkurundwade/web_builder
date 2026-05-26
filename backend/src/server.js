import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import connectDB from "./db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
    path: envPath
})

const PORT = process.env.PORT || 8000;
const geminiKey = process.env.GEMINI_API_KEY || process.env.gemini_API_KEY || "";

const startServer = async () => {
    const { app } = await import("./app.js");
    const dbConnected = await connectDB();

    if (!dbConnected) {
        console.warn("\n⚠️  Server starting WITHOUT database connection.");
        console.warn("   API calls that require MongoDB will fail until the DB is connected.");
        console.warn("   Fix: Go to https://cloud.mongodb.com → Network Access → Add Current IP\n");
    }

    // Always start the HTTP server so port 8000 is reachable
    app.listen(PORT, () => {
        console.log(`⚙️  Server is running at port : ${PORT}`);
        console.log(`[env] loaded from: ${envPath}`);
        console.log(`[gemini] model: ${process.env.GEMINI_MODEL || "gemini-2.0-flash"}`);
        console.log(`[gemini] api key: ${geminiKey ? `loaded (...${geminiKey.slice(-4)})` : "missing"}`);
        if (dbConnected) {
            console.log(`🟢 Status: Ready (DB connected)`);
        } else {
            console.log(`🔴 Status: Running but DB is DOWN — fix IP whitelist in Atlas`);
        }
    });
}

startServer();
