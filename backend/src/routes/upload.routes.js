import { Router } from "express";
import { uploadImages } from "../Controllers/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint: /api/upload
// Uses multer middleware to parse 'files' field. 
// GrapesJS sends multiple files using 'files[]' or 'files' depending on config.
// Using .any() is safer to catch dynamically named arrays for GrapesJS compatibility,
// or .array("files") if strictly configured on frontend.
router.route("/").post(
    verifyJWT, 
    upload.any(), // Safely catch any uploaded files under any variable name (like 'files[]')
    uploadImages
);

export default router;
