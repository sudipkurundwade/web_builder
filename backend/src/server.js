import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    const dbConnected = await connectDB();

    if (!dbConnected) {
        console.warn("\n⚠️  Server starting WITHOUT database connection.");
        console.warn("   API calls that require MongoDB will fail until the DB is connected.");
        console.warn("   Fix: Go to https://cloud.mongodb.com → Network Access → Add Current IP\n");
    }

    // Always start the HTTP server so port 8000 is reachable
    app.listen(PORT, () => {
        console.log(`⚙️  Server is running at port : ${PORT}`);
        if (dbConnected) {
            console.log(`🟢 Status: Ready (DB connected)`);
        } else {
            console.log(`🔴 Status: Running but DB is DOWN — fix IP whitelist in Atlas`);
        }
    });
}

startServer();
