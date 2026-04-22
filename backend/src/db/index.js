import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // MONGO_URI already includes trailing slash — append DB name directly
        const uri = process.env.MONGO_URI?.endsWith("/")
            ? `${process.env.MONGO_URI}grapesjs_editor`
            : `${process.env.MONGO_URI}/grapesjs_editor`;

        const connectionInstance = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // fail fast (10s instead of 30s)
        });
        console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        return true;
    } catch (error) {
        console.error("\n❌ MONGODB connection FAILED!");
        if (error.message?.includes("Could not connect to any servers")) {
            console.error("👉 Your IP is NOT whitelisted in MongoDB Atlas.");
            console.error("   Go to: https://cloud.mongodb.com → Network Access → Add Current IP");
        } else {
            console.error(error.message);
        }
        // Return false instead of process.exit so server still boots
        return false;
    }
}

export default connectDB;
