import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

let configured = false;

const configureCloudinary = () => {
    if (configured) return;

    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
        throw new Error("Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
    }

    cloudinary.config({ cloud_name, api_key, api_secret });
    configured = true;
};

/**
 * Uploads a file from local disk to Cloudinary and deletes the local copy.
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if (!localFilePath) return null;
        configureCloudinary();
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect if it's image/video/raw
            folder: "web-builder/assets",
            ...options,
        });
        
        // File uploaded successfully, remove from local temp folder
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return response;
        
    } catch (error) {
        // Safe cleanup if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", error);
        return null;
    }
};

export { configureCloudinary, uploadOnCloudinary };
