import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";

// Ensure the directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.resolve(__dirname, "../../public/temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Set up storage engine using simple disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Generate a clean distinct filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const allowedMimeTypes = new Set([
    "application/pdf",
]);

const fileFilter = (req, file, cb) => {
    const isAllowed =
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/") ||
        allowedMimeTypes.has(file.mimetype);

    if (!isAllowed) {
        return cb(new Error("Only image, video, and PDF files can be uploaded"));
    }

    cb(null, true);
};

const maxFileSizeMb = Number(process.env.CLOUDINARY_MAX_FILE_SIZE_MB || 100);

// Create upload instance
export const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 }
});

export const uploadMediaFiles = (req, res, next) => {
    upload.any()(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(400, `File is too large. Maximum size is ${maxFileSizeMb} MB.`));
        }

        return next(new ApiError(400, error.message || "Failed to upload file"));
    });
};
