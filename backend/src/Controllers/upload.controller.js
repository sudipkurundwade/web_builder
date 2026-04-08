import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Handles image upload from GrapesJS AssetManager.
 * GrapesJS natively expects JSON format: { data: [ "url_1", "url_2" ] }
 */
const uploadImages = asyncHandler(async (req, res) => {
    let files = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        files = req.files;
    } else if (req.file) {
        files = [req.file];
    }

    if (!files || files.length === 0 || !files[0]) {
        throw new ApiError(400, "No file uploaded");
    }

    const uploadedUrls = [];

    // Process all uploaded files
    for (const file of files) {
        if (!file) continue;
        const localPath = file.path;
        
        const uploadResult = await uploadOnCloudinary(localPath);
        
        if (!uploadResult || !uploadResult.secure_url) {
            continue; // Could optionally throw error, but skipping failed is safer for batches
        }
        
        uploadedUrls.push(uploadResult.secure_url);
    }

    if (uploadedUrls.length === 0) {
        throw new ApiError(500, "Failed to upload files to Cloudinary");
    }

    // Return GrapesJS specific JSON format!
    return res.status(200).json({
        data: uploadedUrls
    });
});

export { uploadImages };
