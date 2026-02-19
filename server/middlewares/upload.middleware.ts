import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { log } from '../src/logging/logging';
import { existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UPLOAD_TMP_DIR = join(tmpdir(), 'sftp-gateway-uploads');

if (!existsSync(UPLOAD_TMP_DIR)) {
  mkdirSync(UPLOAD_TMP_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_TMP_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    log("warn", "upload_error", {
      requestId: req.requestId,
      error: err.message,
      code: err.code,
    });

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        status: "error",
        requestId: req.requestId,
        error: {
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          code: "FILE_TOO_LARGE",
          maxSize: MAX_FILE_SIZE,
        },
      });
      return;
    }

    res.status(400).json({
      status: "error",
      requestId: req.requestId,
      error: {
        message: err.message,
        code: "UPLOAD_ERROR",
      },
    });
    return;
  }

  if (err) {
    log("error", "upload_unexpected_error", {
      requestId: req.requestId,
      error: err.message,
    });
    res.status(500).json({
      status: "error",
      requestId: req.requestId,
      error: {
        message: "File upload failed",
        code: "INTERNAL_ERROR",
      },
    });
    return;
  }

  next();
}
