import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AppError } from "../utils/AppError.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIRECTORY = path.join(currentDirectory, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
}

const ALLOWED_FILE_TYPES = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".gif": ["image/gif"],
  ".webp": ["image/webp"],
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".txt": ["text/plain"],
  ".csv": ["text/csv", "application/vnd.ms-excel"],
  ".zip": ["application/zip", "application/x-zip-compressed"],
};

function getExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ALLOWED_FILE_TYPES[getExtension(file.originalname)];

  if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        "This file type is not allowed. Upload an image, PDF, Office document, text file or zip.",
        400
      )
    );
  }

  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${getExtension(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
