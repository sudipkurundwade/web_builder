import { Router } from "express";
import { uploadImages } from "../Controllers/upload.controller.js";
import { uploadMediaFiles } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint: /api/upload
// Uses multer middleware to parse 'files' field. 
// GrapesJS sends multiple files using 'files[]' or 'files' depending on config.
// Using .any() is safer to catch dynamically named arrays for GrapesJS compatibility,
// or .array("files") if strictly configured on frontend.
router.route("/").post(
    verifyJWT, 
    uploadMediaFiles,
    uploadImages
);

export default router;
